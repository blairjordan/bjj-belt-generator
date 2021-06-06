import { exec } from 'child_process';
import path from 'path';
import yargs, { Argv } from 'yargs';

const COLORS = {
  purple: '#6a0dad',
  blue: '#0056c7',
  brown: '#88442c',
  black: '#0e0e0e',
  red: '#da0000'
};

interface Args {
  color: string;
  name: string;
  instructor: string;
}

const hash = (input: string) => input.split('').reduce((a,b) =>{ a=( (a<<5) - a) + b.charCodeAt(0); return a&a }, 0);

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

const TEMP_PATH = 'images/temp';
const OUTPUT_PATH = 'images/output';

const SIZE = '600x30';

//convert -size 600x30 xc: -seed 33333 +noise Random -modulate 20,0 noise.png
//convert belt.png \( noise.png -normalize +level 1,4% \) -compose screen -composite output.png

const generateBelt = async (color: string, outputFile: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const stroke = (color !== 'black') ? 'black' : 'red';
    const cmd = `convert -size ${SIZE} xc:${COLORS[color]} -fill black -stroke '${COLORS[stroke]}' -strokewidth 100 -draw "stroke-linecap square path 'M 120,0 L 120,1'" ${outputFile}`;
    console.log(cmd);
    exec(cmd,
    (error, stdout, stderr) => {
      if (error)  { reject(error);  }
      if (stderr) { reject(stderr); }
      resolve(stdout);
    });
  });

const generateNoise = async (seed: number, outputFile: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const cmd = `convert -size ${SIZE} xc: -seed ${seed} +noise Random -modulate 20,0 ${outputFile}`;
    console.log(cmd);
    exec(cmd,
    (error, stdout, stderr) => {
      if (error)  { reject(error);  }
      if (stderr) { reject(stderr); }
      resolve(stdout);
    });
  });

const generateCompositetempBeltFile = async (beltFile: string, noiseFile: string, outputFile: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const cmd = `convert ${beltFile} \\( ${noiseFile} -normalize +level 1,4% \\) -compose screen -composite ${outputFile}`;
    console.log(cmd);
    exec(cmd,
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
    const tempBeltFile = path.join(TEMP_PATH,  `belt.png`);
    const tempNoiseFile = path.join(TEMP_PATH, `noise.png`);
    const outputFile = path.join(OUTPUT_PATH, `belt-composite.png`);
    
    try {
      await generateBelt(color, tempBeltFile);
      await generateNoise(hash(`${name} ${color} ${instructor}`), tempNoiseFile);
      await generateCompositetempBeltFile(tempBeltFile, tempNoiseFile, outputFile);
      
  } catch (error) {
      console.error('An error occured', error);
    }
  }
})();

