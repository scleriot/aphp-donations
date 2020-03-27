const { sanitizeEntity } = require('strapi-utils');
const crypto = require('crypto');
const _ = require('lodash');
const grant = require('grant-koa');

module.exports = {
  async create(ctx) {
    const { email, username, password, role, firstname, lastname } = ctx.request.body;

    const advanced = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    if (!email) return ctx.badRequest('missing.email');
    if (!username) return ctx.badRequest('missing.username');
    if (!password) return ctx.badRequest('missing.password');

    const userWithSameUsername = await strapi
      .query('user', 'users-permissions')
      .findOne({ username });

    if (userWithSameUsername) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.username.taken',
          message: 'Username already taken.',
          field: ['username'],
        })
      );
    }

    if (advanced.unique_email) {
      const userWithSameEmail = await strapi.query('user', 'users-permissions').findOne({ email });

      if (userWithSameEmail) {
        return ctx.badRequest(
          null,

          formatError({
            id: 'Auth.form.error.email.taken',
            message: 'Email already taken.',
            field: ['email'],
          })
        );
      }
    }

    await strapi.plugins['email'].services.email.send({
      to: email,
      from: "cleriotsimon@gmail.com",
      bcc: "cleriotsimon@gmail.com",
      subject: "Création du compte sur APHP Suivi des dons",
      text: `Bonjour ${firstname} ${lastname},\r\n\r\n

      Voici les accès pour se connecter à l'outil de gestion des dons :\r\n
      * Email : ${email}\r\n
      * Mot de passe : ${password}\r\n
      * Adresse de connexion : http://www.suividesdons.aphp.fr/\r\n\r\n

      Bien cordialement,\r\n
      Simon Cleriot`,
      html: `Bonjour ${firstname} ${lastname},<br /><br />

      Voici les accès pour se connecter à l'outil de gestion des dons :
      <ul>
        <li>Email : <b>${email}</b></li>
        <li>Mot de passe : <b>${password}</b></li>
        <li>Adresse de connexion : http://www.suividesdons.aphp.fr/</li>
      </ul>
      <br /><br />
      Bien cordialement,<br />
      Simon Cleriot`
    })

    console.log("Email sent")

    const user = {
      ...ctx.request.body,
      provider: 'local',
    };

    if (!role) {
      const defaultRole = await strapi
        .query('role', 'users-permissions')
        .findOne({ type: advanced.default_role }, []);

      user.role = defaultRole.id;
    }

    try {
      const data = await strapi.plugins['users-permissions'].services.user.add(user);

      ctx.created(data);
    } catch (error) {
      ctx.badRequest(null, formatError(error));
    }
  },

  async update(ctx) {
    const { email, username, password, firstname, lastname } = ctx.request.body;

    const advancedConfigs = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const { id } = ctx.params;

    const user = await strapi.plugins['users-permissions'].services.user.fetch({
      id,
    });

    if (_.has(ctx.request.body, 'email') && !email) {
      return ctx.badRequest('email.notNull');
    }

    if (_.has(ctx.request.body, 'username') && !username) {
      return ctx.badRequest('username.notNull');
    }

    if (_.has(ctx.request.body, 'password') && !password && user.provider === 'local') {
      return ctx.badRequest('password.notNull');
    }

    if (_.has(ctx.request.body, 'username')) {
      const userWithSameUsername = await strapi
        .query('user', 'users-permissions')
        .findOne({ username });

      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.username.taken',
            message: 'username.alreadyTaken.',
            field: ['username'],
          })
        );
      }
    }

    if (_.has(ctx.request.body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi.query('user', 'users-permissions').findOne({ email });

      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.taken',
            message: 'Email already taken',
            field: ['email'],
          })
        );
      }
    }

    let updateData = {
      ...ctx.request.body,
    };

    if (_.has(ctx.request.body, 'password') && password === user.password) {
      delete updateData.password;
    } else {
      await strapi.plugins['email'].services.email.send({
        to: email,
        from: "cleriotsimon@gmail.com",
        bcc: "cleriotsimon@gmail.com",
        subject: "Création du compte sur APHP Suivi des dons",
        text: `Bonjour ${firstname} ${lastname},\r\n\r\n

        Voici les accès pour se connecter à l'outil de gestion des dons :\r\n
        * Email : ${email}\r\n
        * Mot de passe : ${password}\r\n
        * Adresse de connexion : http://www.suividesdons.aphp.fr/\r\n\r\n

        Bien cordialement,\r\n
        Simon Cleriot`,
        html: `Bonjour ${firstname} ${lastname},<br /><br />

        Voici les accès pour se connecter à l'outil de gestion des dons :
        <ul>
          <li>Email : <b>${email}</b></li>
          <li>Mot de passe : <b>${password}</b></li>
          <li>Adresse de connexion : http://www.suividesdons.aphp.fr/</li>
        </ul>
        <br /><br />
        Bien cordialement,<br />
        Simon Cleriot`
      })

      console.log("Email sent")
    }

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData);

    ctx.send(data);
  }
};
