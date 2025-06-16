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


export {
    sendMailToRegister,
    sendMailToRecoveryPassword

}
