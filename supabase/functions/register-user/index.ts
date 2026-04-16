import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { email, password, cpf, role } = await req.json();

    if (!email || !password || !cpf || !role) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados obrigatórios ausentes." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedEmail = String(email).trim().toLowerCase();
    const cpfDigits = String(cpf).replace(/\D/g, "");

    if (cpfDigits.length !== 11) {
      return new Response(
        JSON.stringify({ success: false, error: "CPF inválido." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: existingCpf, error: cpfError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("cpf", cpfDigits)
      .limit(1);

    if (cpfError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao validar CPF." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (existingCpf && existingCpf.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Este CPF já está cadastrado." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // limpa usuário órfão no auth com mesmo email e sem profile
    const { data: usersPage, error: listUsersError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (listUsersError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao validar e-mail." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingAuthUser = usersPage.users.find(
      (user) => (user.email || "").trim().toLowerCase() === normalizedEmail
    );

    if (existingAuthUser) {
      const { data: existingProfileByUser, error: existingProfileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("auth_user_id", existingAuthUser.id)
        .maybeSingle();

      if (existingProfileError) {
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao validar e-mail." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (existingProfileByUser) {
        return new Response(
          JSON.stringify({ success: false, error: "Este e-mail já está cadastrado." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const { error: deleteOrphanError } = await supabaseAdmin.auth.admin.deleteUser(
        existingAuthUser.id
      );

      if (deleteOrphanError) {
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao limpar cadastro anterior." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          role,
          cpf: cpfDigits,
          accepted_terms: true,
        },
      });

    if (createUserError || !createdUser.user) {
      const msg = createUserError?.message?.toLowerCase() || "";

      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("user already registered")
      ) {
        return new Response(
          JSON.stringify({ success: false, error: "Este e-mail já está cadastrado." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: createUserError?.message || "Erro ao criar usuário.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = createdUser.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      auth_user_id: userId,
      email: normalizedEmail,
      role,
      cpf: cpfDigits,
      accepted_terms: true,
      accepted_terms_at: new Date().toISOString(),
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);

      const msg = profileError.message?.toLowerCase() || "";

      if (msg.includes("cpf") || msg.includes("duplicate")) {
        return new Response(
          JSON.stringify({ success: false, error: "Este CPF já está cadastrado." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar perfil." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log("REGISTER USER FUNCTION ERROR:", error);

    return new Response(
      JSON.stringify({ success: false, error: "Erro interno." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});