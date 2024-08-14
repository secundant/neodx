/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: [
    {
      type: 'published-components',
      fileId:
        'https://www.figma.com/file/UdQdzfwr9K9EUrC33xtRKg/Figma-2023-Showcase?type=design&node-id=42-121&mode=design&t=Bli1W8fNU2PEfgBg-0',
      output: 'assets/icons',
      filter: node => node.name.startsWith('size')
    },
    {
      // will be empty, it's an external file
      type: 'published-components',
      output: 'assets/wolf',
      fileId:
        'https://www.figma.com/file/etBvPUmYLbPrflacduH34n/The-Wolf-Kit-Social-Icons-(Community)-(Community)?type=design&node-id=857-23516&mode=design&t=LMaPc1V6gVhfz2Np-0'
    }
  ]
};
