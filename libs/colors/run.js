import { colors } from './dist/index.mjs';

console.log('───────────────────────────────────────');
console.log('        Welcome to Colorful Text!        ');
console.log('───────────────────────────────────────');
console.log('');

console.log(colors.red('   Red   '));
console.log(colors.green('  Green  '));
console.log(colors.yellow(' Yellow '));
console.log(colors.blue('   Blue  '));
console.log(colors.magenta('Magenta'));
console.log(colors.cyan('  Cyan   '));
console.log(colors.white('  White  '));
console.log(colors.gray('  Gray   '));

console.log('');

console.log(colors.bgRed('  Red Background   '));
console.log(colors.bgGreen(' Green Background  '));
console.log(colors.bgYellow('Yellow Background  '));
console.log(colors.bgBlue('  Blue Background  '));
console.log(colors.bgMagenta('Magenta Background '));
console.log(colors.bgCyan(' Cyan Background   '));
console.log(colors.bgWhite(' White Background  '));

console.log('');

console.log(colors.bold('      Bold Text       '));
console.log(colors.dim('     Dim Text      '));
console.log(colors.italic('    Italic Text    '));
console.log(colors.underline('  Underlined Text  '));
console.log(colors.inverse('Inverse Color Text'));
console.log(colors.hidden('    Hidden Text    '));
console.log(colors.strikethrough('Strikethrough Text'));

console.log('');
console.log('');

// Let's create a sentence with words in different colors and styles
console.log(
  colors.red('Roses') +
    ' are ' +
    colors.bgWhite(colors.blue('blue')) +
    ' and ' +
    colors.underline(colors.green('leaves')) +
    ' are ' +
    colors.magenta(colors.bold('magenta.'))
);

console.log('');

// Now let's create a rainbow pattern using the colors
console.log(
  colors.red('R') +
    colors.yellow('a') +
    colors.green('i') +
    colors.cyan('n') +
    colors.blue('b') +
    colors.magenta('o') +
    colors.red('w')
);

console.log('');

// Let's add some more styles to our sentence
console.log(
  colors.bgRed(colors.white(colors.italic('The quick brown fox jumps over the lazy dog.')))
);
console.log(colors.strikethrough(colors.bgRed("But the lazy dog doesn't care.")));

console.log('');
console.log('───────────────────────────────────────');
console.log("           That's all, folks!           ");
console.log('───────────────────────────────────────');
