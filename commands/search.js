const superagent = require('superagent');
const cheerio = require('cheerio');
const querystring = require('querystring');

const fallback = async (message, args, safe, client) => {
  let url = `https://www.google.com/search?safe=${safe}&q=${encodeURI(args)}`;
  superagent.get(url).end((err, res) => {
    if (err) client.error(err);
    const $ = cheerio.load(res.text);
    const href = $('.r').first().find('a').first().attr('href');
    try {
      const result = Object.keys(querystring.parse(href.substr(7, href.length)))[0];
      if (result !== '?q') message.edit(result).catch(() => message.edit('`No results found!`'));
      else message.edit('`No results found!`');
    } catch (err) {
      message.edit('`No results found!`');
    }
  });
}

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.trimLeft();
    const msg = await message.channel.sendMessage('`Searching...`');
    const key = client.keys.getKey();
    const s = await client.rethink.fetchGuild(msg.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = msg.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Search:', msg.guild.name, msg.guild.id, '|', args, '|', safe, '|', key, client.keys.lastKey);
    let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${client.config.google.cx}&safe=${safe}&q=${encodeURI(args)}`;
    superagent.get(url).end((err, res) => {
      if (err) {
        return fallback(msg, args, safe, client);
      }
      msg.edit(JSON.parse(res.text)['items'][0]['link']).catch(err => {
        if (err) {
          return fallback(msg, args, safe, client);
        }
      });
    });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
