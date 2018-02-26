#!/usr/bin/env node

'use strict';
const beautify = require('js-beautify')

const templateReg = /<(?:\/)?template[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/ig
const scriptReg = /<(?:\/)?script[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/ig
const styleReg = /<(?:\/)?style[\s\S]*?(?:lang="\s*(.*)\s*")?\s*(?:scoped)?\s*>/ig

const config = {
  "indent_size": 2,
  "indent_level": 6,
  "brace_style": "collapse,preserve-inline",
  "keep_array_indentation": true,
  "max_preserve_newlines": 2
}

function getCode(code, block, expReg) {
  let match = code.match(expReg)
  if (!match) {
    return null
  }

  let split = code.split(expReg, 4)
  if (!/src/.test(match)) {
    if (block === "template") {
      if (!split[1]) {
        return match[0] + '\n' + beautify.html(split[2], config) + '\n' + match[1]
      }
    } else if (block === "style") {
      if (split[1] === undefined || split[1] === 'scss' || split[1] === 'less') {
        return match[0] + '\n' + beautify.css(split[2], config) + '\n' + match[1]
      }
    } else {
      if (split[1] === undefined || split[1] === 'TypeScript') {
        return match[0] + '\n' + beautify(split[2], config) + '\n' + match[1]
      }
    }
  }
  return match[0] + split[2] + match[1]
}

function vue(text) {
  if (!text) {
    return
  }

  let html = getCode(text, 'template', templateReg)
  let script = getCode(text, 'script', scriptReg)
  let style = getCode(text, 'style', styleReg)
  return (html ? html + '\n' : '') + (script ? '\n' + script + '\n' : '') + (style ? '\n' + style + '\n' : '')
}

const fs = require("fs")

function main() {
  let f = process.argv[2]
  if (!f) return

  let a = fs.readFileSync(f, { encoding: "utf8" })
  let b = vue(a)
  fs.writeFileSync(f, b)
}

main()
