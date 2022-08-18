import chalk from 'chalk';

export const logger = {
  info(name: string, ...messages: unknown[]) {
    console.info(
      chalk.blue('info'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  },
  warn(name: string, ...messages: unknown[]) {
    console.warn(
      chalk.blue('warn'),
      chalk.bold(`${name}${messages.length > 0 ? ': ' : ''}`),
      ...messages
    );
  },
  stringify: {
    filesTree(files: string[], initialPrefix = '') {
      const groups = createFilesNode();
      const add = (parts: string[], target: FilesNode) => {
        const [name, ...other] = parts;

        if (other.length === 0) {
          target.files.push(name);
        } else {
          if (!target.nodes.has(name)) {
            target.nodes.set(name, createFilesNode());
          }
          add(other, target.nodes.get(name)!);
        }
      };
      const stringify = (node: FilesNode, prefix: string): string =>
        [`${prefix}${node.files.join(', ')}`]
          .concat(
            Array.from(node.nodes).flatMap(([name, node]) => [
              `${prefix}${name}/`,
              stringify(node, `${prefix}  `.replaceAll(/./g, '·'))
            ])
          )
          .join('\n');

      for (const file of files) {
        add(file.split(/\/|\\/), groups);
      }
      return stringify(groups, initialPrefix.replaceAll(/./g, '·'));
    }
  }
};

interface FilesNode {
  files: string[];
  nodes: Map<string, FilesNode>;
}

const createFilesNode = (): FilesNode => ({
  files: [],
  nodes: new Map()
});
