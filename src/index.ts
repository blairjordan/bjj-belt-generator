import { exec } from 'child_process';
import path from 'path';
import yargs, { Argv } from 'yargs';

interface Args {
  color: string;
  name: string;
  instructor: string;
}

const argv = yargs.command('serve', 'Start the server.', (yargs: Argv) =>
  yargs
    .option('color', {
      type: 'string',
      describe: 'Belt color',
      demandOption: true
    })
    .option('name', {
      type: 'string',
      describe: `Recipient's name`,
      demandOption: true
    })
    .option('instructor', {
      type: 'string',
      describe: 'Instructor issuing belt',
      demandOption: true
    })
).argv;

const { color, name, instructor } = argv as Args;
const OUTPUT_PATH = 'images/output';
const TEMPLATE_PATH = 'images/belt-templates';

const convert = async (beltTemplateFile: string, name: string, instructor: string, outputFile: string): Promise<any> =>
  new Promise((resolve, reject) => {
    exec(`magick convert ${beltTemplateFile} -background white label:"${name}\nInstructor: ${instructor}" -gravity center -append ${outputFile}`,
    (error, stdout, stderr) => {
      if (error)  { reject(error);  }
      if (stderr) { reject(stderr); }
      resolve(stdout);
    });
  });

(async () => {
  if (!(color && name && instructor)) {
    console.error('Required: color, name, instructor');
  } else {
    const beltTemplateFile = path.join(TEMPLATE_PATH, `${color.toLowerCase()}-belt.svg`);
    const outputFile = path.join(OUTPUT_PATH, `${color.toLowerCase()}-belt.png`);
    console.info(`Name: ${name}\nBelt: ${color}\nInstructor: ${instructor}\nOutput file: ${outputFile}`);
    try {
      const stdout = await convert(beltTemplateFile, name, instructor, outputFile);
      console.log(stdout);
    } catch (error) {
      console.error('An error occured', error);
    }
  }
})();