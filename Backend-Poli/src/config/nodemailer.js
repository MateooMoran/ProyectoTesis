import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});


const sendMailToRegister = (nombre, userMail, token) => {


let mailOptions = {
    from: '"PoliVentas 🦉" <no-reply@gmail.com>',
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
};



    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
        }
    })
}

const sendMailToRecoveryPassword = async (userMail, token) => {
    try {
        const info = await transporter.sendMail({
            from: '"PoliVentas 🦉" <no-reply@gmail.com>',
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

        console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo de recuperación: ", error);
    }
};

const sendMailToAssignSeller = async (userMail, nombreVendedor, rol) => {
    try {
        const mensajeHTML = rol === "vendedor"
            ? `
            <div
                style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fafafa; text-align: center;">

                <h2 style="font-size: 26px; color: #2C3E50; margin-bottom: 15px;">
                    ¡Felicidades, ${nombreVendedor}!
                </h2>

                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN"
                    style="height: 100px; margin-top: 20px; margin-bottom: 20px;">

                <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                    Has sido asignado como <strong>${rol}</strong> en <strong>PoliVentas</strong>.
                    Ya puedes comenzar a gestionar tus productos y realizar ventas desde tu panel.
                </p>

                <a href="${process.env.URL_FRONTEND}vendedor"
                    style="background-color: #0A2342; color: white; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; text-decoration: none; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: inline-block; transition: background-color 0.3s;">
                    Ir al panel de vendedor
                </a>

                <p style="font-size: 14px; color: #555; margin-top: 30px;">
                    Si tienes dudas o necesitas ayuda, no dudes en contactarnos.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">

                <footer style="font-size: 0.9em; color: #777;">
                    El equipo de <strong>PoliVentas</strong> está para ayudarte.<br>
                    © ${new Date().getFullYear()} PoliVentas - EPN
                </footer>
            </div>
            `
            : `
            <div
                style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff8f8; text-align: center;">

                <h2 style="font-size: 26px; color: #C0392B; margin-bottom: 15px;">
                    Qué pena, ${nombreVendedor} 😢
                </h2>

                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Escuela_Polit%C3%A9cnica_Nacional.png" alt="Logo EPN"
                    style="height: 100px; margin-top: 20px; margin-bottom: 20px;">

                <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                    Se te ha quitado el rol de <strong>vendedor</strong> en <strong>PoliVentas</strong>.
                    Ahora tienes permisos como <strong>${rol}</strong>.
                </p>

                <p style="font-size: 14px; color: #555; margin-top: 30px;">
                    Si crees que esto fue un error o deseas más información, contáctanos.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 10px;">

                <footer style="font-size: 0.9em; color: #777;">
                    El equipo de <strong>PoliVentas</strong> sigue contigo 💪<br>
                    © ${new Date().getFullYear()} PoliVentas - EPN
                </footer>
            </div>
            `;

        const info = await transporter.sendMail({
            from: '"PoliVentas 🦉" <no-reply@gmail.com>',
            to: userMail,
            subject: rol === "vendedor"
                ? "🦉 PoliVentas - Has sido asignado como Vendedor"
                : "🦉 PoliVentas - Cambio de Rol",
            html: mensajeHTML
        });

        console.log("Correo de asignación enviado correctamente: ", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo de asignación de vendedor: ", error);
    }
};


export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToAssignSeller
}
