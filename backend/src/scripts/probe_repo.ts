import https from 'https';

const probes = [
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/England/Premier%20League/Arsenal%20FC.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/England/Arsenal%20FC.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/GB1/Arsenal%20FC.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/GB1/Arsenal.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/ENG1/Arsenal.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/Premier%20League/Arsenal.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/ENG/Premier%20League/Arsenal.png',
    'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/England/Arsenal.png'
];

const check = (url: string) => {
    https.get(url, (res) => {
        console.log(`${res.statusCode} : ${url}`);
    });
};

probes.forEach(check);
