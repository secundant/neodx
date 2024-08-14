const { formatExportFileName } = require('@neodx/figma');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId:
      'https://www.figma.com/file/H9kVbqMwzIxh579BpXKZbj/Weather--Icons-Kit-(Community)?type=design&node-id=0-1',
    output: 'assets/icons',
    write: {
      getExportFileName({ format, value }, root) {
        const parent = root.registry.byId[value.parentId];

        return formatExportFileName(
          `${parent.source.name.toLowerCase().replace('32/', '')}.${format}`
        );
      }
    },
    collect: {
      target: [
        {
          type: 'CANVAS',
          filter: 'icon'
        },
        {
          type: 'COMPONENT_SET',
          filter: /32/
        },
        {
          type: 'COMPONENT',
          filter: 'Color=Off'
        }
      ]
    }
  }
};
