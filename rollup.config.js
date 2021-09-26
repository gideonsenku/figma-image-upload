import banner2 from 'rollup-plugin-banner2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import svelte from 'rollup-plugin-svelte'
import postcss from 'rollup-plugin-postcss'
import replace from 'rollup-plugin-replace'
import json from '@rollup/plugin-json'

module.exports = {
  input: 'src/main.js',
  output: {
    file: 'figma-image-upload.user.js',
    format: 'iife'
  },
  plugins: [
    svelte(),
    postcss({
      extract: false,
      minimize: true
    }),
    json(),
    nodeResolve({
      browser: true
    }),
    commonjs(),
    terser({
      ecma: true,
      warnings: false,
      format: {
        beautify: true
      },
      mangle: false,
      keep_classnames: true,
      keep_fnames: true
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.LANG': JSON.stringify('cn')
    }),
    banner2(() => {
      const items = [
        ['name', 'Figma Image Upload'],
        ['namespace', 'https://github.com/gideonsenku'],
        ['version', '0.1.2'],
        ['description', 'Figma Image Upload图片上传工具'],
        ['encoding', 'utf-8'],
        ['author', 'gideonsenku'],
        ['homepage', 'https://github.com/gideon sen ku/figma-image-upload'],
        ['supportURL', 'https://github.com/gideonsenku/figma-image-upload/issues'],
        [
          'updateURL',
          'https://github.com/gideonsenku/figma-image-upload/raw/master/figma-image-upload.user.js'
        ],
        [
          'downloadURL',
          'https://github.com/gideonsenku/figma-image-upload/raw/master/figma-image-upload.user.js'
        ],
        ['match', '*://www.figma.com/file/*'],
        ['match', 'https://nocoding.xyz/figma-image-upload/setting.html'],
        ['run-at', 'document-start'],
        ['icon', 'https://www.google.com/s2/favicons?domain=figma.com'],
        [
          'license',
          'MIT; https://github.com/gideonsenku/figma-image-upload/blob/main/LICENSE'
        ],
        ['grant', 'unsafeWindow'],
        ['grant', 'GM_xmlhttpRequest'],
        ['grant', 'GM_getValue'],
        ['grant', 'GM_setValue']
      ]
      const maxLabelLen = items.reduce(
        (max, [i]) => (max > i.length ? max : i.length),
        0
      )

      return (
        '// ==UserScript==\n' +
        items.reduce((str, [label, content]) => {
          label = label.trim()
          content = content.trim()
          return (
            str +
            `// @${
              label.length < maxLabelLen
                ? label +
                  [...new Array(maxLabelLen - label.length)]
                    .map(() => ' ')
                    .join('')
                : label
            } ${content}\n`
          )
        }, '') +
        '// ==/UserScript==\n'
      )
    })
  ]
}
