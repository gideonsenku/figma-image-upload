// ==UserScript==
// @name        Figma Image Upload
// @namespace   https://github.com/gideonsenku
// @version     0.1.1
// @description Figma Image Upload图片上传工具
// @encoding    utf-8
// @author      gideonsenku
// @homepage    https://github.com/gideon sen ku/figma-image-upload
// @supportURL  https://github.com/gideonsenku/figma-image-upload/issues
// @updateURL   https://github.com/gideonsenku/figma-image-upload/raw/master/figma-image-upload.user.js
// @downloadURL https://github.com/gideonsenku/figma-image-upload/raw/master/figma-image-upload.user.js
// @match       *://www.figma.com/file/*
// @match       https://nocoding.xyz/figma-image-upload/setting.html
// @run-at      document-start
// @icon        https://www.google.com/s2/favicons?domain=figma.com
// @license     MIT; https://github.com/gideonsenku/figma-image-upload/blob/main/LICENSE
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==
!function() {
    "use strict";
    function noop() {}
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return "function" == typeof thing;
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || a && "object" == typeof a || "function" == typeof a;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(" ");
    }
    function listen(node, event, handler, options) {
        return node.addEventListener(event, handler, options), () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        null == value ? node.removeAttribute(attribute) : node.getAttribute(attribute) !== value && node.setAttribute(attribute, value);
    }
    function set_input_value(input, value) {
        input.value = null == value ? "" : value;
    }
    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    const dirty_components = [], binding_callbacks = [], render_callbacks = [], flush_callbacks = [], resolved_promise = Promise.resolve();
    let update_scheduled = !1;
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = !1;
    const seen_callbacks = new Set;
    function flush() {
        if (!flushing) {
            flushing = !0;
            do {
                for (let i = 0; i < dirty_components.length; i += 1) {
                    const component = dirty_components[i];
                    set_current_component(component), update(component.$$);
                }
                for (set_current_component(null), dirty_components.length = 0; binding_callbacks.length; ) binding_callbacks.pop()();
                for (let i = 0; i < render_callbacks.length; i += 1) {
                    const callback = render_callbacks[i];
                    seen_callbacks.has(callback) || (seen_callbacks.add(callback), callback());
                }
                render_callbacks.length = 0;
            } while (dirty_components.length);
            for (;flush_callbacks.length; ) flush_callbacks.pop()();
            update_scheduled = !1, flushing = !1, seen_callbacks.clear();
        }
    }
    function update($$) {
        if (null !== $$.fragment) {
            $$.update(), run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [ -1 ], $$.fragment && $$.fragment.p($$.ctx, dirty), $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set;
    function make_dirty(component, i) {
        -1 === component.$$.dirty[0] && (dirty_components.push(component), function schedule_update() {
            update_scheduled || (update_scheduled = !0, resolved_promise.then(flush));
        }(), component.$$.dirty.fill(0)), component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [ -1 ]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            props: props,
            update: noop,
            not_equal: not_equal,
            bound: blank_object(),
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            callbacks: blank_object(),
            dirty: dirty,
            skip_bound: !1,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = !1;
        if ($$.ctx = instance ? instance(component, options.props || {}, ((i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            return $$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value) && (!$$.skip_bound && $$.bound[i] && $$.bound[i](value), 
            ready && make_dirty(component, i)), ret;
        })) : [], $$.update(), ready = !0, run_all($$.before_update), $$.fragment = !!create_fragment && create_fragment($$.ctx), 
        options.target) {
            if (options.hydrate) {
                const nodes = function children(element) {
                    return Array.from(element.childNodes);
                }(options.target);
                $$.fragment && $$.fragment.l(nodes), nodes.forEach(detach);
            } else $$.fragment && $$.fragment.c();
            options.intro && function transition_in(block, local) {
                block && block.i && (outroing.delete(block), block.i(local));
            }(component.$$.fragment), function mount_component(component, target, anchor, customElement) {
                const {fragment: fragment, on_mount: on_mount, on_destroy: on_destroy, after_update: after_update} = component.$$;
                fragment && fragment.m(target, anchor), customElement || add_render_callback((() => {
                    const new_on_destroy = on_mount.map(run).filter(is_function);
                    on_destroy ? on_destroy.push(...new_on_destroy) : run_all(new_on_destroy), component.$$.on_mount = [];
                })), after_update.forEach(add_render_callback);
            }(component, options.target, options.anchor, options.customElement), flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            !function destroy_component(component, detaching) {
                const $$ = component.$$;
                null !== $$.fragment && (run_all($$.on_destroy), $$.fragment && $$.fragment.d(detaching), 
                $$.on_destroy = $$.fragment = null, $$.ctx = []);
            }(this, 1), this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
            return callbacks.push(callback), () => {
                const index = callbacks.indexOf(callback);
                -1 !== index && callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            this.$$set && !function is_empty(obj) {
                return 0 === Object.keys(obj).length;
            }($$props) && (this.$$.skip_bound = !0, this.$$set($$props), this.$$.skip_bound = !1);
        }
    }
    function create_fragment$1(ctx) {
        let div, t, div_class_value;
        return {
            c() {
                div = element("div"), t = text(ctx[2]), attr(div, "class", div_class_value = "toast " + (ctx[1] ? "" : "toast--hide") + " svelte-1hd7ahf");
            },
            m(target, anchor) {
                insert(target, div, anchor), append(div, t), ctx[4](div);
            },
            p(ctx, [dirty]) {
                4 & dirty && function set_data(text, data) {
                    data = "" + data, text.wholeText !== data && (text.data = data);
                }(t, ctx[2]), 2 & dirty && div_class_value !== (div_class_value = "toast " + (ctx[1] ? "" : "toast--hide") + " svelte-1hd7ahf") && attr(div, "class", div_class_value);
            },
            i: noop,
            o: noop,
            d(detaching) {
                detaching && detach(div), ctx[4](null);
            }
        };
    }
    function instance$1($$self, $$props, $$invalidate) {
        let toast, content, visiable = !1, closeTimer = null;
        return [ toast, visiable, content, function show({title: title, duration: duration = 1500}) {
            $$invalidate(2, content = title), closeTimer && clearTimeout(closeTimer), $$invalidate(1, visiable = !0), 
            closeTimer = setTimeout((() => {
                $$invalidate(1, visiable = !1), closeTimer = null;
            }), duration);
        }, function div_binding($$value) {
            binding_callbacks[$$value ? "unshift" : "push"]((() => {
                toast = $$value, $$invalidate(0, toast);
            }));
        } ];
    }
    !function styleInject(css, ref) {
        void 0 === ref && (ref = {});
        var insertAt = ref.insertAt;
        if (css && "undefined" != typeof document) {
            var head = document.head || document.getElementsByTagName("head")[0], style = document.createElement("style");
            style.type = "text/css", "top" === insertAt && head.firstChild ? head.insertBefore(style, head.firstChild) : head.appendChild(style), 
            style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
        }
    }(".toast.svelte-1hd7ahf{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:4px;background-color:rgba(0,0,0,.8);padding:12px 24px;max-width:200px;color:#eee;font-size:16px;z-index:9999999}.toast--hide.svelte-1hd7ahf{z-index:-1;visibility:hidden}");
    class Toast extends SvelteComponent {
        constructor(options) {
            super(), init(this, options, instance$1, create_fragment$1, safe_not_equal, {
                show: 3
            });
        }
        get show() {
            return this.$$.ctx[3];
        }
    }
    const toast = function(createInstance, {withKey: withKey = !1, immediate: immediate = !1} = {}) {
        const UNDEFINED_INSTANCE = {};
        let _key, _instance = UNDEFINED_INSTANCE;
        function getSingleton(key) {
            return _instance !== UNDEFINED_INSTANCE && function checkSameKey(key) {
                return !withKey || void 0 === key || key === _key;
            }(key) || (_key = key, _instance = createInstance(_key)), _instance;
        }
        return immediate && getSingleton(), getSingleton;
    }((() => {
        const toastEl = new Toast({
            target: document.body,
            props: {
                content: ""
            }
        });
        return ({title: title, duration: duration = 1500}) => {
            toastEl.show({
                title: title,
                duration: duration
            });
        };
    }))();
    function create_fragment(ctx) {
        let div3, div2, div0, t1, div1, input, t2, button, mounted, dispose;
        return {
            c() {
                div3 = element("div"), div2 = element("div"), div0 = element("div"), div0.textContent = "配置url地址", 
                t1 = space(), div1 = element("div"), input = element("input"), t2 = space(), button = element("button"), 
                button.textContent = "保存", attr(div0, "class", "text-blue-800 font-medium mb-3"), 
                attr(input, "type", "text"), attr(input, "placeholder", "url"), attr(input, "class", "px-3 py-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base border-0 shadow outline-none\n      focus:outline-none w-full"), 
                attr(div1, "class", "mb-3 pt-0"), attr(button, "class", "bg-blue-600 text-white active:bg-blue-600 font-bold uppercase text-base px-8 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"), 
                attr(button, "type", "button");
            },
            m(target, anchor) {
                insert(target, div3, anchor), append(div3, div2), append(div2, div0), append(div2, t1), 
                append(div2, div1), append(div1, input), set_input_value(input, ctx[0]), append(div3, t2), 
                append(div3, button), mounted || (dispose = [ listen(input, "input", ctx[2]), listen(button, "click", ctx[1]) ], 
                mounted = !0);
            },
            p(ctx, [dirty]) {
                1 & dirty && input.value !== ctx[0] && set_input_value(input, ctx[0]);
            },
            i: noop,
            o: noop,
            d(detaching) {
                detaching && detach(div3), mounted = !1, run_all(dispose);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let uploadUrl = GM_getValue("UPLOAD_URL", "");
        return [ uploadUrl, function save() {
            try {
                GM_setValue("UPLOAD_URL", uploadUrl), toast({
                    title: "保存成功"
                });
            } catch (e) {
                toast({
                    title: e.message
                });
            }
        }, function input_input_handler() {
            uploadUrl = this.value, $$invalidate(0, uploadUrl);
        } ];
    }
    class SettingPanel extends SvelteComponent {
        constructor(options) {
            super(), init(this, options, instance, create_fragment, safe_not_equal, {});
        }
    }
    const figmaImageUpload = () => {
        if (!/^https:\/\/www\.figma.com/.test(window.location.href)) return;
        const base64BtnWrapper = document.createElement("div"), base64Btn = document.createElement("button");
        function insertBase64Btn() {
            const exportBtn = document.querySelectorAll("button[class*=export_panel--exportButton]")[0];
            exportBtn && (!base64Btn.className && base64Btn.classList.add(...exportBtn.className.split(" ")), 
            !base64BtnWrapper.className && base64BtnWrapper.classList.add(...exportBtn.parentElement.className.split(" ")), 
            exportBtn.parentElement.parentElement.insertBefore(base64BtnWrapper, exportBtn.parentElement.nextSibling));
        }
        function getConstraintByScale(scale) {
            return "0.5x" === scale ? {
                type: "SCALE",
                value: .5
            } : "0.75x" === scale ? {
                type: "SCALE",
                value: .75
            } : "1x" === scale ? {
                type: "SCALE",
                value: 1
            } : "1.5x" === scale ? {
                type: "SCALE",
                value: 1.5
            } : "2x" === scale ? {
                type: "SCALE",
                value: 2
            } : "3x" === scale ? {
                type: "SCALE",
                value: 3
            } : "4x" === scale ? {
                type: "SCALE",
                value: 4
            } : "512w" === scale ? {
                type: "WIDTH",
                value: 512
            } : "512h" === scale ? {
                type: "HEIGHT",
                value: 512
            } : void 0;
        }
        base64Btn.innerText = "上传OSS", base64Btn.addEventListener("click", (function() {
            const scaleInputs = Array.apply(null, document.querySelectorAll('input[spellcheck="false"][autocomplete="new-password"][class^=raw_components--textInput]')), scales = Array.from(new Set(scaleInputs.map((ele => ele.value))));
            if (scales.length) {
                const {selection: selection} = figma.currentPage;
                if (!selection[0]) return void alert("请选择要处理的节点");
                Promise.all(scales.map((scale => selection[0].exportAsync({
                    format: "PNG",
                    constraint: getConstraintByScale(scale)
                })))).then((u8List => {
                    const blob = new Blob([ u8List ], {
                        type: "image/png"
                    }), data = new FormData;
                    data.append("file", blob, (new Date).getTime() + ".png");
                    const url = GM_getValue("UPLOAD_URL", "");
                    return new Promise(((resolve, reject) => {
                        GM_xmlhttpRequest({
                            url: url,
                            method: "POST",
                            data: data,
                            onload(xhr) {
                                resolve(JSON.parse(xhr.responseText).url);
                            }
                        });
                    }));
                })).then((url => {
                    !function copyContent(text) {
                        if (void 0 === navigator.clipboard) {
                            const textarea = window.document.querySelector("#copy-area");
                            textarea.value = text, textarea.focus(), textarea.select();
                            return void (window.document.execCommand("copy") ? parent.postMessage({
                                pluginMessage: {
                                    type: "success"
                                }
                            }, "*") : parent.postMessage({
                                pluginMessage: {
                                    type: "fail"
                                }
                            }, "*"));
                        }
                        navigator.clipboard.writeText(text).then((function() {
                            parent.postMessage({
                                pluginMessage: {
                                    type: "success"
                                }
                            }, "*");
                        }), (function(_err) {
                            parent.postMessage({
                                pluginMessage: {
                                    type: "fail"
                                }
                            }, "*");
                        }));
                    }(url), figma.notify("图片上传成功，以复制到剪切板");
                }));
            }
        })), base64BtnWrapper.appendChild(base64Btn), function addExportTabEventListener() {
            const node = document.querySelectorAll("[data-label=export]")[0];
            node ? node.addEventListener("click", (function() {
                setTimeout((() => {
                    insertBase64Btn(), function addAddBtnEventListener() {
                        document.querySelectorAll("span[aria-label^=Add]")[0]?.addEventListener("click", (function() {
                            setTimeout((() => {
                                insertBase64Btn();
                            }), 100);
                        }));
                    }();
                }), 100);
            })) : setTimeout((() => {
                addExportTabEventListener();
            }), 500);
        }();
    };
    /^https:\/\/nocoding\.xyz\/figma-image-upload\/setting/.test(window.location.href) && (window.onload = () => {
        const mainEl = document.querySelector("main");
        new SettingPanel({
            target: mainEl
        });
    }), figmaImageUpload();
}();
