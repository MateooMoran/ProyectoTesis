import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMailToRegister = async (nombre, userMail, token) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: userMail,
      subject: "🦉 PoliVentas - Confirmar tu cuenta",
      html: `
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fafafa; text-align: center;">
        <h2 style="font-size: 28px; color: #2C3E50; margin-bottom: 15px; line-height: 1.3;">
            Hola ${nombre} <br>
            Gracias por unirte a <strong>🦉 PoliVentas</strong>
        </h2>
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN"
            style="height: 100px; margin-top: 20px; margin-bottom: 20px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            Gracias por registrarte. Para confirmar tu cuenta, por favor haz clic en el siguiente botón:
        </p>
        <a href="${process.env.URL_FRONTEND}/confirm/${token}"
            style="background-color: #0A2342; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; text-decoration: none; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: inline-block; transition: background-color 0.3s;">
            Confirmar cuenta
        </a>
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Si no te registraste, puedes ignorar este mensaje.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">
        <footer style="font-size: 0.9em; color: #777;">
            El equipo de <strong>PoliVentas</strong> te da la más cordial bienvenida.<br>
            © ${new Date().getFullYear()} PoliVentas - EPN
        </footer>
    </div>
    `
    });

    if (error) {
      console.error("Error al enviar correo de registro:", error);
      return false;
    }

    console.log("Correo de registro enviado:", data?.id);
    return true;
  } catch (err) {
    console.error("Error al enviar correo de registro:", err);
    return false;
  }
};

const sendMailToRecoveryPassword = async (userMail, token) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: userMail,
      subject: "🦉 PoliVentas - Recuperar tu contraseña",
      html: `
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fafafa; text-align: center;">
        <h2 style="font-size: 26px; color: #2C3E50; margin-bottom: 15px;">
            Hola<br>
            ¿Olvidaste tu contraseña?
        </h2>
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN"
            style="height: 100px; margin-top: 20px; margin-bottom: 20px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            No te preocupes. Para reestablecer tu contraseña, haz clic en el siguiente botón:
        </p>
        <a href="${process.env.URL_FRONTEND}/reset/${token}"
            style="background-color: #0A2342; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; text-decoration: none; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: inline-block; transition: background-color 0.3s;">
            Reestablecer contraseña
        </a>
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">
        <footer style="font-size: 0.9em; color: #777;">
            El equipo de <strong>PoliVentas</strong> está para ayudarte.<br>
            © ${new Date().getFullYear()} PoliVentas - EPN
        </footer>
    </div>
    `
    });

    if (error) {
      console.error("Error al enviar correo de recuperación:", error);
      return false;
    }

    console.log("Correo de recuperación enviado:", data?.id);
    return true;
  } catch (err) {
    console.error("Error al enviar correo de recuperación:", err);
    return false;
  }
};

const sendMailToAssignSeller = async (userMail, nombreVendedor, rol) => {
  const mensajeHTML = rol === "vendedor"
    ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fafafa; text-align: center;">
            <h2 style="font-size: 26px; color: #2C3E50; margin-bottom: 15px;">¡Felicidades, ${nombreVendedor}!</h2>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN" style="height: 100px; margin-top: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                Has sido asignado como <strong>${rol}</strong> en <strong>PoliVentas</strong>.
                Ya puedes comenzar a gestionar tus productos y realizar ventas desde tu panel.
            </p>
            <a href="${process.env.URL_FRONTEND}vendedor" style="background-color: #0A2342; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; text-decoration: none; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: inline-block; transition: background-color 0.3s;">
                Ir al panel de vendedor
            </a>
            <p style="font-size: 14px; color: #555; margin-top: 30px;">Si tienes dudas o necesitas ayuda, no dudes en contactarnos.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">
            <footer style="font-size: 0.9em; color: #777;">El equipo de <strong>PoliVentas</strong> está para ayudarte.<br>© ${new Date().getFullYear()} PoliVentas - EPN</footer>
        </div>`
    : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff8f8; text-align: center;">
            <h2 style="font-size: 26px; color: #C0392B; margin-bottom: 15px;">Qué pena, ${nombreVendedor} 😢</h2>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN" style="height: 100px; margin-top: 20px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">Se te ha quitado el rol de <strong>vendedor</strong> en <strong>PoliVentas</strong>. Ahora tienes permisos como <strong>${rol}</strong>. Puedes seguir accediendo a tu cuenta, pero tus productos y ventas se encuentran inactivos.</p>
            <p style="font-size: 14px; color: #555; margin-top: 30px;">Si crees que esto fue un error o deseas más información, contáctanos.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">
            <footer style="font-size: 0.9em; color: #777;">El equipo de <strong>PoliVentas</strong> sigue contigo 💪<br>© ${new Date().getFullYear()} PoliVentas - EPN</footer>
        </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: userMail,
      subject: rol === "vendedor"
        ? "🦉 PoliVentas - Has sido asignado como Vendedor"
        : "🦉 PoliVentas - Cambio de Rol",
      html: mensajeHTML
    });

    if (error) {
      console.error("Error al enviar correo de asignación:", error);
      return false;
    }

    console.log("Correo de asignación enviado:", data?.id);
    return true;
  } catch (err) {
    console.error("Error al enviar correo de asignación:", err);
    return false;
  }
};

const sendMailWelcomeWithPassword = async (userMail, nombre, plainPassword) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: userMail,
      subject: "🦉 Bienvenido/a a PoliVentas - Tu clave de acceso",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fafafa; text-align: center;">
        <h2 style="font-size: 26px; color: #2C3E50; margin-bottom: 15px;">¡Hola ${nombre}! 👋<br>Bienvenido/a a PoliVentas</h2>
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN" style="height: 100px; margin-top: 20px; margin-bottom: 20px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">Tu cuenta ha sido creada exitosamente con Google. Esta es tu clave temporal para iniciar sesión:</p>
        <div style="background-color: #0A2342; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 18px; display: inline-block; margin-bottom: 20px;">
            ${plainPassword}
        </div>
        <p style="font-size: 14px; color: #555; margin-top: 30px;">Por seguridad, cámbiala después de iniciar sesión.</p>
        <a href="${process.env.URL_FRONTEND}/login" style="background-color: #28a745; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; text-decoration: none; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: inline-block; transition: background-color 0.3s;">
            Ir a iniciar sesión
        </a>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">
        <footer style="font-size: 0.9em; color: #777;">El equipo de <strong>PoliVentas</strong> está para ayudarte.<br>© ${new Date().getFullYear()} PoliVentas - EPN</footer>
    </div>
    `
    });

    if (error) {
      console.error("Error al enviar correo de bienvenida:", error);
      return false;
    }

    console.log("Correo de bienvenida enviado:", data?.id);
    return true;
  } catch (err) {
    console.error("Error al enviar correo de bienvenida:", err);
    return false;
  }
};

const sendMailRecomendaciones = async (email, nombre, productos) => {
  if (!productos || productos.length === 0) {
    console.log("No hay productos para recomendar");
    return false;
  }

  try {
    const cardsHTML = productos.map(p => `
      <div style="display: flex; background-color: #f8f9fa; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 3px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="flex: 1; max-width: 150px;">
              <img src="${p.imagen || p.imagenIA || `${process.env.URL_FRONTEND}/default.jpg`}" 
                   alt="${p.nombreProducto}" 
                   style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="flex: 2; padding: 15px;">
              <h3 style="margin: 0 0 10px; color: #0A2342;">${p.nombreProducto}</h3>
              <p style="margin: 0 0 10px; color: #555; font-size: 14px;">
                  ${p.descripcion ? (p.descripcion.length > 80 ? p.descripcion.substring(0, 80) + "..." : p.descripcion) : ""}
              </p>
              <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 16px;">
                  $${typeof p.precio === "number" ? p.precio.toFixed(2) : p.precio}
              </p>
          </div>
      </div>
    `).join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; background: #ffffff; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #0A2342; margin-bottom: 20px;">¡Hola ${nombre}! 👋</h2>
          <p style="color: #555; font-size: 16px; margin-bottom: 30px;">
              Basado en tus compras y favoritos recientes, te recomendamos estos productos:
          </p>

          ${cardsHTML}

          <a href="${process.env.URL_FRONTEND}" 
             style="background-color: #0A2342; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 30px 0;">
             Ver más productos
          </a>

          <p style="font-size: 13px; color: #777; margin-top: 30px;">
              Estas recomendaciones se basan en tus intereses dentro de PoliVentas.<br>
              © ${new Date().getFullYear()} PoliVentas - EPN
          </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "🦉 Tus recomendaciones personalizadas en PoliVentas",
      html
    });

    if (error) {
      console.error("Error al enviar recomendaciones:", error);
      return false;
    }

    console.log("Correo de recomendaciones enviado:", data?.id);
    return true;

  } catch (error) {
    console.error("Error al enviar recomendaciones:", error);
    return false;
  }
};

const sendMailOrdenCompra = async (email, nombre, orden) => {
  if (!orden || !orden.productos || orden.productos.length === 0) {
    console.log("⚠️ No hay productos en la orden");
    return false;
  }

  try {
    const totalNumber = Number(orden.total) || 0;

    const productosHTML = orden.productos.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.imagen || `${process.env.URL_FRONTEND}/default.jpg`}" 
               alt="${item.nombreProducto}" 
               style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #0A2342; font-weight: bold;">
          ${item.nombreProducto}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; text-align: center;">
          ${item.cantidad}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #28a745; text-align: right;">
          $${typeof item.precioUnitario === "number" ? item.precioUnitario.toFixed(2) : Number(item.precioUnitario || 0).toFixed(2)}
        </td>
      </tr>
    `).join("");

    const { data, error } = await resend.emails.send({
      from: `PoliVentas 🦉 <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "🦉 PoliVentas - Factura de tu Orden",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <div style="background-color: #0A2342; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">PoliVentas 🦉</h1>
            <p style="margin: 5px 0 0 0;">Factura de tu Orden</p>
          </div>

          <div style="padding: 20px;">
            <h2 style="color: #0A2342;">¡Gracias por tu compra, ${nombre}! 🎉</h2>
            <p style="color: #555; font-size: 14px;">Aquí tienes el detalle de tu compra:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Imagen</th>
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${productosHTML}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; color: #0A2342;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #28a745;">
                    $${totalNumber.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 8px; color: #2e7d32; font-weight: bold;">
              Estado: ${orden.estado} <br>
              Método de pago: ${orden.metodoPago}
            </div>

            <p style="margin-top: 20px; font-size: 13px; color: #777;">
              Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos. <br>
              © ${new Date().getFullYear()} PoliVentas - EPN
            </p>
          </div>

        </div>
      `
    });

    if (error) {
      console.error("Error al enviar correo de factura:", error);
      return false;
    }

    console.log("Correo de factura enviado:", data?.id);
    return true;

  } catch (error) {
    console.error("Error al enviar correo de factura:", error);
    return false;
  }
};

export {
  sendMailToRegister,
  sendMailToRecoveryPassword,
  sendMailToAssignSeller,
  sendMailWelcomeWithPassword,
  sendMailRecomendaciones,
  sendMailOrdenCompra
};