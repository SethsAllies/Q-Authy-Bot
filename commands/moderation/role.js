export default {
  name: 'role',
  aliases: ['addrole', 'removerole'],
  description: 'Add or remove roles from users',
  usage: '!role add/remove @user [role]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('❌ You need Manage Roles permission to use this command!');
    }
    
    if (args.length < 3) {
      return message.reply('❌ Usage: `!role add/remove @user [role name]`');
    }
    
    const action = args[0].toLowerCase();
    if (!['add', 'remove'].includes(action)) {
      return message.reply('❌ Please specify `add` or `remove`!');
    }
    
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Please mention a valid member!');
    }
    
    const roleName = args.slice(2).join(' ');
    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (!role) {
      return message.reply('❌ Role not found!');
    }
    
    if (role.position >= message.member.roles.highest.position) {
      return message.reply('❌ You cannot manage this role!');
    }
    
    try {
      if (action === 'add') {
        if (member.roles.cache.has(role.id)) {
          return message.reply('❌ User already has this role!');
        }
        await member.roles.add(role);
        message.reply(`✅ Added role **${role.name}** to **${member.user.username}**`);
      } else {
        if (!member.roles.cache.has(role.id)) {
          return message.reply('❌ User doesn\'t have this role!');
        }
        await member.roles.remove(role);
        message.reply(`✅ Removed role **${role.name}** from **${member.user.username}**`);
      }
    } catch (error) {
      message.reply('❌ Failed to manage role! Check my permissions.');
    }
  }
};