// Importing fs for file system excessibility
const fs = require('fs');

// exporting html5Private function as html5Public
exports.cPublic = cPrivate;
exports.mPublic = mPrivate;
exports.ccPublic = ccPrivate;
exports.javaPublic = javaPrivate;
exports.py3Public = py3Private;
exports.flaskPublic = flaskPrivate;
exports.html5Public = html5Private;
exports.css3Public = css3Private;
exports.appjsPublic = appjsPrivate;

function cPrivate() {
    // Reading c boilerplate
    const c = fs.readFileSync(`${__dirname}/main_files/main.c`);
    const filename = process.argv[2];
    // Writing c to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, c);
}

function mPrivate() {
    // Reading objective-c boilerplate
    const m = fs.readFileSync(`${__dirname}/main_files/main.m`);
    const filename = process.argv[2];
    // Writing objective-c to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, m);
}

function ccPrivate() {
    // Reading c++ boilerplate
    const cc = fs.readFileSync(`${__dirname}/main_files/main.cc`);
    const filename = process.argv[2];
    // Writing c++ to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, cc);
}

function javaPrivate() {
    // Reading java boilerplate
    const java = fs.readFileSync(`${__dirname}/main_files/main.java`);
    const filename = process.argv[2];
    // Writing java to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, java);
}

function py3Private() {
    // Reading python boilerplate
    const py3 = fs.readFileSync(`${__dirname}/main_files/main.py`);
    const filename = process.argv[2];
    // Writing python to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, py3);
}

function flaskPrivate() {
    // Reading python flask boilerplate
    const flask = fs.readFileSync(`${__dirname}/main_files/flask.py`);
    const filename = process.argv[2];
    // Writing python flask to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, flask);
}

function html5Private() {
    // Reading html5 boilerplate
    const html5 = fs.readFileSync(`${__dirname}/main_files/index.html`);
    const filename = process.argv[2];
    // Writing html5 to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, html5);
}

function css3Private() {
    // Reading css3 boilerplate
    const css3 = fs.readFileSync(`${__dirname}/main_files/index.css`);
    const filename = process.argv[2];
    // Writing css3 to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, css3);
}

function appjsPrivate() {
    // Reading nodejs boilerplate
    const appjs = fs.readFileSync(`${__dirname}/main_files/app.js`);
    const filename = process.argv[2];
    // Writing nodejs to file
    fs.writeFileSync(`${process.cwd()}/${filename}`, appjs);
}