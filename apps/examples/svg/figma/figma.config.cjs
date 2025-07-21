const { formatExportFileName } = require('@neodx/figma');
const { cases } = require('@neodx/std');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId:
      'https://www.figma.com/file/qjGIOVF6243bClGjQid2Y5/Int-UI-Icons-(Community)?type=design&node-id=955-20814',
    output: 'src/shared/ui/icon/assets',
    getExportFileName({ format, node }, root) {
      const componentsSet = root.registry.byId[node.parentId];
      const frame = root.registry.byId[componentsSet.parentId];
      const frameName = cases.kebab(frame.source.name);
      const parentName = cases.kebab(componentsSet.source.name.replace(/^[^/]*\//, '').trim());

      return formatExportFileName(`${frameName}/${parentName}.${format}`);
    },
    collect: {
      target: [
        // Our icons are placed in "Icons" canvas, "General" section and "General" and "Tool Windows" frames
        {
          type: 'CANVAS',
          filter: 'Icons'
        },
        {
          type: 'SECTION',
          filter: 'General'
        },
        {
          type: 'FRAME',
          filter: ['General', 'Tool Windows']
        },
        // Ignoring hidden components and 20x20 components
        {
          type: 'COMPONENT_SET',
          // Ignoring hidden components and 20x20 components
          filter: node => node.source.visible !== false && !node.source.name.includes('20x20')
        },
        {
          type: 'COMPONENT',
          // Ignoring the "Dark" theme, it can be covered by colors in CSS
          filter: 'Light'
        }
      ]
    }
  }
};
