
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/components/Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (19:16) {#each items as item}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = "#" + /*item*/ ctx[4]);
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "aria-current", "page");
    			toggle_class(a, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(a, file$3, 20, 24, 908);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$3, 19, 20, 817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items*/ 1 && a_href_value !== (a_href_value = "#" + /*item*/ ctx[4])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(a, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:16) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let div1;
    	let nav;
    	let div0;
    	let span;
    	let t1;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Diyi Liu's website";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "fs-4");
    			add_location(span, file$3, 14, 16, 611);
    			attr_dev(div0, "class", "d-flex justify-content-start headertitle svelte-1b2sk13");
    			add_location(div0, file$3, 13, 12, 540);
    			attr_dev(ul, "class", "nav nav-pills justify-content-end headertitle svelte-1b2sk13");
    			add_location(ul, file$3, 17, 12, 700);
    			attr_dev(nav, "class", "d-flex flex-wrap py-3 mb-4 border-bottom navbar navbar-default fixed-top bg-light");
    			add_location(nav, file$3, 10, 2, 211);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file$3, 9, 4, 179);
    			add_location(header, file$3, 8, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, nav);
    			append_dev(nav, div0);
    			append_dev(div0, span);
    			append_dev(nav, t1);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (items === undefined && !('items' in $$props || $$self.$$.bound[$$self.$$.props['items']])) {
    			console.warn("<Header> was created without expected prop 'items'");
    		}

    		if (activeItem === undefined && !('activeItem' in $$props || $$self.$$.bound[$$self.$$.props['activeItem']])) {
    			console.warn("<Header> was created without expected prop 'activeItem'");
    		}
    	});

    	const writable_props = ['items', 'activeItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch('tabChange', item);

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get items() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/Footer.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Last Update Augest, 2023";
    			attr_dev(div, "class", "copyright svelte-8ht0rm");
    			add_location(div, file$2, 1, 4, 13);
    			attr_dev(footer, "class", "svelte-8ht0rm");
    			add_location(footer, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Rightbar.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/components/Rightbar.svelte";

    function create_fragment$1(ctx) {
    	let segment;
    	let div;
    	let hr0;
    	let t0;
    	let h40;
    	let t2;
    	let p;
    	let t4;
    	let ul0;
    	let li0;
    	let t5;
    	let a0;
    	let t7;
    	let li1;
    	let t8;
    	let a1;
    	let t10;
    	let hr1;
    	let t11;
    	let h41;
    	let t13;
    	let ul1;
    	let li2;
    	let t15;
    	let li3;
    	let t17;
    	let li4;
    	let t19;
    	let li5;
    	let t21;
    	let hr2;
    	let t22;
    	let h42;
    	let t24;
    	let ul2;
    	let li6;
    	let a2;
    	let t26;
    	let br0;
    	let t27;
    	let br1;
    	let t28;
    	let li7;
    	let t29;
    	let br2;
    	let t30;
    	let br3;
    	let t31;
    	let li8;
    	let a3;
    	let t33;
    	let br4;
    	let t34;
    	let br5;
    	let t35;
    	let li9;
    	let a4;
    	let t37;
    	let br6;
    	let t38;
    	let br7;
    	let t39;
    	let li10;
    	let a5;
    	let t41;
    	let br8;
    	let t42;
    	let br9;
    	let t43;
    	let li11;
    	let a6;
    	let t45;
    	let br10;
    	let t46;
    	let br11;
    	let t47;
    	let hr3;

    	const block = {
    		c: function create() {
    			segment = element("segment");
    			div = element("div");
    			hr0 = element("hr");
    			t0 = space();
    			h40 = element("h4");
    			h40.textContent = "Contact Me";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Feel free to contact me by the following ways:";
    			t4 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			t5 = text("Email: ");
    			a0 = element("a");
    			a0.textContent = "dliu27@vols.utk.edu";
    			t7 = space();
    			li1 = element("li");
    			t8 = text("Github: ");
    			a1 = element("a");
    			a1.textContent = "thefriedbee";
    			t10 = space();
    			hr1 = element("hr");
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Papers & Reports:";
    			t13 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			li2.textContent = "Paper 1";
    			t15 = space();
    			li3 = element("li");
    			li3.textContent = "Paper 2";
    			t17 = space();
    			li4 = element("li");
    			li4.textContent = "Paper 3";
    			t19 = space();
    			li5 = element("li");
    			li5.textContent = "Paper 4";
    			t21 = space();
    			hr2 = element("hr");
    			t22 = space();
    			h42 = element("h4");
    			h42.textContent = "Fun Projects:";
    			t24 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			a2 = element("a");
    			a2.textContent = "Covid-19 Particle Simulation Game";
    			t26 = space();
    			br0 = element("br");
    			t27 = text("\n            Demonstrate Covid-19 transmission using iteractive buttons, animations and moving particles.\n            One particle could transmit virus to another when two particles are close to each other.\n            One can recreate SIR-like patterns through this simulation.\n            One can play with different strategies to see their effectiveness. \n            ");
    			br1 = element("br");
    			t28 = space();
    			li7 = element("li");
    			t29 = text("AI plays 2048\n            ");
    			br2 = element("br");
    			t30 = text("\n            An agent-based algorithms excels at playing 2048\n            ");
    			br3 = element("br");
    			t31 = space();
    			li8 = element("li");
    			a3 = element("a");
    			a3.textContent = "3D data visualizer";
    			t33 = space();
    			br4 = element("br");
    			t34 = text("\n            Visualzing the traffic Fundamental Diagram (speed vs. occupancy vs. volume)\n            ");
    			br5 = element("br");
    			t35 = space();
    			li9 = element("li");
    			a4 = element("a");
    			a4.textContent = "GTFS2STN (v1.0)";
    			t37 = space();
    			br6 = element("br");
    			t38 = text("\n            Analyzing accessibilities of transit system using the GTFS open source datasets\n            ");
    			br7 = element("br");
    			t39 = space();
    			li10 = element("li");
    			a5 = element("a");
    			a5.textContent = "Video Car Counter";
    			t41 = space();
    			br8 = element("br");
    			t42 = text("\n            A local app helps to manually counts vehicles (built by PyQt)\n            ");
    			br9 = element("br");
    			t43 = space();
    			li11 = element("li");
    			a6 = element("a");
    			a6.textContent = "PABE";
    			t45 = space();
    			br10 = element("br");
    			t46 = text("\n            Plan Ahead and Breathe Ease. A demonstration of using Google Maps API for routing information\n            in Python. The App can help you find a travel route miminize inhale air pollution risks (for ).\n            ");
    			br11 = element("br");
    			t47 = space();
    			hr3 = element("hr");
    			add_location(hr0, file$1, 7, 4, 59);
    			attr_dev(h40, "class", "svelte-138o4h1");
    			add_location(h40, file$1, 8, 4, 68);
    			add_location(p, file$1, 10, 4, 93);
    			attr_dev(a0, "href", "mailto:dliu27@vols.utk.edu");
    			add_location(a0, file$1, 14, 19, 330);
    			attr_dev(li0, "class", "list-group-item list-group-item-light");
    			add_location(li0, file$1, 13, 8, 259);
    			attr_dev(a1, "href", "https://github.com/thefriedbee/");
    			add_location(a1, file$1, 16, 20, 475);
    			attr_dev(li1, "class", "list-group-item list-group-item-light");
    			add_location(li1, file$1, 15, 8, 404);
    			attr_dev(ul0, "class", "list-group svelte-138o4h1");
    			add_location(ul0, file$1, 11, 4, 151);
    			add_location(hr1, file$1, 20, 4, 673);
    			attr_dev(h41, "class", "svelte-138o4h1");
    			add_location(h41, file$1, 21, 4, 682);
    			attr_dev(li2, "class", "list-group-item list-group-item-light");
    			add_location(li2, file$1, 23, 8, 745);
    			attr_dev(li3, "class", "list-group-item list-group-item-light");
    			add_location(li3, file$1, 24, 8, 816);
    			attr_dev(li4, "class", "list-group-item list-group-item-light");
    			add_location(li4, file$1, 25, 8, 887);
    			attr_dev(li5, "class", "list-group-item list-group-item-light");
    			add_location(li5, file$1, 26, 8, 958);
    			attr_dev(ul1, "class", "list-group svelte-138o4h1");
    			add_location(ul1, file$1, 22, 4, 713);
    			add_location(hr2, file$1, 29, 4, 1036);
    			attr_dev(h42, "class", "svelte-138o4h1");
    			add_location(h42, file$1, 30, 4, 1045);
    			attr_dev(a2, "href", "https://thefriedbee.github.io/Covid-19-ABM/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$1, 33, 12, 1168);
    			add_location(br0, file$1, 34, 12, 1288);
    			add_location(br1, file$1, 39, 12, 1663);
    			attr_dev(li6, "class", "list-group-item list-group-item-light");
    			add_location(li6, file$1, 32, 8, 1105);
    			add_location(br2, file$1, 43, 12, 1779);
    			add_location(br3, file$1, 45, 12, 1857);
    			attr_dev(li7, "class", "list-group-item list-group-item-light");
    			add_location(li7, file$1, 41, 8, 1690);
    			attr_dev(a3, "href", "speed_volume_occupancy.html");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$1, 49, 12, 1948);
    			add_location(br4, file$1, 50, 12, 2037);
    			add_location(br5, file$1, 52, 12, 2142);
    			attr_dev(li8, "class", "list-group-item list-group-item-light");
    			add_location(li8, file$1, 48, 8, 1885);
    			attr_dev(a4, "href", "https://github.com/thefriedbee/GTFS2STN");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$1, 56, 12, 2233);
    			add_location(br6, file$1, 57, 12, 2331);
    			add_location(br7, file$1, 59, 12, 2440);
    			attr_dev(li9, "class", "list-group-item list-group-item-light");
    			add_location(li9, file$1, 55, 8, 2170);
    			attr_dev(a5, "href", "https://github.com/thefriedbee/CarCounter");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$1, 63, 12, 2524);
    			add_location(br8, file$1, 64, 12, 2626);
    			add_location(br9, file$1, 66, 12, 2717);
    			attr_dev(li10, "class", "list-group-item bg-transparent");
    			add_location(li10, file$1, 62, 8, 2468);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$1, 70, 12, 2801);
    			add_location(br10, file$1, 71, 12, 2850);
    			add_location(br11, file$1, 74, 12, 3081);
    			attr_dev(li11, "class", "list-group-item bg-transparent");
    			add_location(li11, file$1, 69, 8, 2745);
    			attr_dev(ul2, "class", "list-group svelte-138o4h1");
    			add_location(ul2, file$1, 31, 4, 1073);
    			add_location(hr3, file$1, 77, 4, 3114);
    			attr_dev(div, "class", "rightbar svelte-138o4h1");
    			add_location(div, file$1, 6, 0, 32);
    			add_location(segment, file$1, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, segment, anchor);
    			append_dev(segment, div);
    			append_dev(div, hr0);
    			append_dev(div, t0);
    			append_dev(div, h40);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(div, t4);
    			append_dev(div, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, t5);
    			append_dev(li0, a0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, t8);
    			append_dev(li1, a1);
    			append_dev(div, t10);
    			append_dev(div, hr1);
    			append_dev(div, t11);
    			append_dev(div, h41);
    			append_dev(div, t13);
    			append_dev(div, ul1);
    			append_dev(ul1, li2);
    			append_dev(ul1, t15);
    			append_dev(ul1, li3);
    			append_dev(ul1, t17);
    			append_dev(ul1, li4);
    			append_dev(ul1, t19);
    			append_dev(ul1, li5);
    			append_dev(div, t21);
    			append_dev(div, hr2);
    			append_dev(div, t22);
    			append_dev(div, h42);
    			append_dev(div, t24);
    			append_dev(div, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, a2);
    			append_dev(li6, t26);
    			append_dev(li6, br0);
    			append_dev(li6, t27);
    			append_dev(li6, br1);
    			append_dev(ul2, t28);
    			append_dev(ul2, li7);
    			append_dev(li7, t29);
    			append_dev(li7, br2);
    			append_dev(li7, t30);
    			append_dev(li7, br3);
    			append_dev(ul2, t31);
    			append_dev(ul2, li8);
    			append_dev(li8, a3);
    			append_dev(li8, t33);
    			append_dev(li8, br4);
    			append_dev(li8, t34);
    			append_dev(li8, br5);
    			append_dev(ul2, t35);
    			append_dev(ul2, li9);
    			append_dev(li9, a4);
    			append_dev(li9, t37);
    			append_dev(li9, br6);
    			append_dev(li9, t38);
    			append_dev(li9, br7);
    			append_dev(ul2, t39);
    			append_dev(ul2, li10);
    			append_dev(li10, a5);
    			append_dev(li10, t41);
    			append_dev(li10, br8);
    			append_dev(li10, t42);
    			append_dev(li10, br9);
    			append_dev(ul2, t43);
    			append_dev(ul2, li11);
    			append_dev(li11, a6);
    			append_dev(li11, t45);
    			append_dev(li11, br10);
    			append_dev(li11, t46);
    			append_dev(li11, br11);
    			append_dev(div, t47);
    			append_dev(div, hr3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(segment);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rightbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Rightbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Rightbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rightbar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let div5;
    	let div3;
    	let hr0;
    	let t1;
    	let div2;
    	let div0;
    	let h20;
    	let t3;
    	let ul0;
    	let li0;
    	let t5;
    	let li1;
    	let t6;
    	let a0;
    	let t8;
    	let div1;
    	let img;
    	let img_src_value;
    	let t9;
    	let hr1;
    	let t10;
    	let h21;
    	let t12;
    	let ul1;
    	let li2;
    	let t14;
    	let li3;
    	let t16;
    	let li4;
    	let t18;
    	let hr2;
    	let t19;
    	let h22;
    	let t21;
    	let ul2;
    	let li5;
    	let a1;
    	let t23;
    	let li6;
    	let a2;
    	let t25;
    	let li7;
    	let a3;
    	let t27;
    	let li8;
    	let a4;
    	let t29;
    	let li9;
    	let a5;
    	let t31;
    	let hr3;
    	let t32;
    	let h23;
    	let t34;
    	let ul3;
    	let li10;
    	let a6;
    	let t36;
    	let br0;
    	let t37;
    	let li11;
    	let a7;
    	let t39;
    	let br1;
    	let t40;
    	let li12;
    	let a8;
    	let t42;
    	let br2;
    	let t43;
    	let li13;
    	let a9;
    	let t45;
    	let br3;
    	let t46;
    	let hr4;
    	let t47;
    	let h24;
    	let t49;
    	let ul4;
    	let li14;
    	let t51;
    	let li15;
    	let t53;
    	let li16;
    	let t55;
    	let hr5;
    	let t56;
    	let h25;
    	let t58;
    	let ul5;
    	let li17;
    	let t60;
    	let li18;
    	let t62;
    	let li19;
    	let t64;
    	let hr6;
    	let t65;
    	let h26;
    	let t67;
    	let ul6;
    	let li20;
    	let t69;
    	let li21;
    	let t71;
    	let li22;
    	let t73;
    	let hr7;
    	let t74;
    	let div4;
    	let rightbar;
    	let t75;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				activeItem: /*activeItem*/ ctx[0],
    				items: /*items*/ ctx[1]
    			},
    			$$inline: true
    		});

    	header.$on("tabChange", /*tabChange*/ ctx[2]);
    	rightbar = new Rightbar({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div5 = element("div");
    			div3 = element("div");
    			hr0 = element("hr");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Diyi Liu";
    			t3 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Ph.D student in Transportation Engineering at University of Tennessee, Knoxville";
    			t5 = space();
    			li1 = element("li");
    			t6 = text("Advisor: ");
    			a0 = element("a");
    			a0.textContent = "Dr. Lee D Han";
    			t8 = space();
    			div1 = element("div");
    			img = element("img");
    			t9 = space();
    			hr1 = element("hr");
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = "Research Interests";
    			t12 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			li2.textContent = "Scalable data computation tasks";
    			t14 = space();
    			li3 = element("li");
    			li3.textContent = "Machine Learning applications";
    			t16 = space();
    			li4 = element("li");
    			li4.textContent = "Computer Science algorithms, traffic simulation, optimization algorithms, etc.";
    			t18 = space();
    			hr2 = element("hr");
    			t19 = space();
    			h22 = element("h2");
    			h22.textContent = "Programs Involved";
    			t21 = space();
    			ul2 = element("ul");
    			li5 = element("li");
    			a1 = element("a");
    			a1.textContent = "CPS program";
    			t23 = space();
    			li6 = element("li");
    			a2 = element("a");
    			a2.textContent = "GATE scholarship";
    			t25 = space();
    			li7 = element("li");
    			a3 = element("a");
    			a3.textContent = "TDOT Smartway";
    			t27 = space();
    			li8 = element("li");
    			a4 = element("a");
    			a4.textContent = "NCST 1";
    			t29 = space();
    			li9 = element("li");
    			a5 = element("a");
    			a5.textContent = "NCST 2";
    			t31 = space();
    			hr3 = element("hr");
    			t32 = space();
    			h23 = element("h2");
    			h23.textContent = "Important Papers & Reports";
    			t34 = space();
    			ul3 = element("ul");
    			li10 = element("li");
    			a6 = element("a");
    			a6.textContent = "Innovative Method for Estimating Large Truck Volume Using Aggregate Volume and Occupancy Data Incorporating Empirical Knowledge Into Linear Programming";
    			t36 = space();
    			br0 = element("br");
    			t37 = space();
    			li11 = element("li");
    			a7 = element("a");
    			a7.textContent = "Evaluating the Sustainability Impacts of Intelligent Carpooling Systems for SOV Commuters in the Atlanta Region";
    			t39 = space();
    			br1 = element("br");
    			t40 = space();
    			li12 = element("li");
    			a8 = element("a");
    			a8.textContent = "Analyzing Robustness of the Deep Reinforcement Learning Algorithm in Ramp Metering Applications Considering False Data Injection Attack and Defense";
    			t42 = space();
    			br2 = element("br");
    			t43 = space();
    			li13 = element("li");
    			a9 = element("a");
    			a9.textContent = "Evaluating Sustainability Impacts of Intelligent Carpooling/Vanpooling System among SOV Commuters, Phase II: Park and Ride Interactions";
    			t45 = space();
    			br3 = element("br");
    			t46 = space();
    			hr4 = element("hr");
    			t47 = space();
    			h24 = element("h2");
    			h24.textContent = "My Skillsets";
    			t49 = space();
    			ul4 = element("ul");
    			li14 = element("li");
    			li14.textContent = "Programming Language: Python, R, JavaScript, C++, SQL, git, etc.";
    			t51 = space();
    			li15 = element("li");
    			li15.textContent = "Python Packages: Numpy, Matplotlib, Pandas, PyTorch, Keras, Gurobipy, etc.";
    			t53 = space();
    			li16 = element("li");
    			li16.textContent = "Industrial Softwares: SUMO, Vissim, ArcGIS, QGIS, Matlab, Simio, etc.";
    			t55 = space();
    			hr5 = element("hr");
    			t56 = space();
    			h25 = element("h2");
    			h25.textContent = "Preferred Methodologies";
    			t58 = space();
    			ul5 = element("ul");
    			li17 = element("li");
    			li17.textContent = "Modeling: Statistical Machine Learning & Deep Learning.";
    			t60 = space();
    			li18 = element("li");
    			li18.textContent = "Optimization: Reinforcement Learning, Linear/Convex Optimization, etc.";
    			t62 = space();
    			li19 = element("li");
    			li19.textContent = "Visualization: scientific & interactive diagrams";
    			t64 = space();
    			hr6 = element("hr");
    			t65 = space();
    			h26 = element("h2");
    			h26.textContent = "Long-term Knowledge Sharing";
    			t67 = space();
    			ul6 = element("ul");
    			li20 = element("li");
    			li20.textContent = "Numpy tutorial";
    			t69 = space();
    			li21 = element("li");
    			li21.textContent = "Matplolib tutorial";
    			t71 = space();
    			li22 = element("li");
    			li22.textContent = "More tutorials";
    			t73 = space();
    			hr7 = element("hr");
    			t74 = space();
    			div4 = element("div");
    			create_component(rightbar.$$.fragment);
    			t75 = space();
    			create_component(footer.$$.fragment);
    			add_location(hr0, file, 20, 3, 640);
    			attr_dev(h20, "id", "Bio");
    			attr_dev(h20, "class", "svelte-15tcqce");
    			add_location(h20, file, 23, 5, 698);
    			add_location(li0, file, 25, 6, 763);
    			attr_dev(a0, "href", "https://cee.utk.edu/people/lee-d-han/");
    			add_location(a0, file, 26, 19, 872);
    			add_location(li1, file, 26, 6, 859);
    			attr_dev(ul0, "class", "list-unstyled");
    			add_location(ul0, file, 24, 5, 730);
    			attr_dev(div0, "class", "col-md-8");
    			add_location(div0, file, 22, 4, 670);
    			if (!src_url_equal(img.src, img_src_value = "/img/my-img.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-fluid");
    			attr_dev(img, "alt", "My Photo");
    			add_location(img, file, 30, 5, 997);
    			attr_dev(div1, "class", "col-md-4");
    			add_location(div1, file, 29, 4, 969);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file, 21, 3, 648);
    			add_location(hr1, file, 34, 3, 1087);
    			attr_dev(h21, "id", "Research");
    			attr_dev(h21, "class", "svelte-15tcqce");
    			add_location(h21, file, 35, 3, 1095);
    			add_location(li2, file, 37, 4, 1171);
    			add_location(li3, file, 38, 4, 1216);
    			add_location(li4, file, 39, 4, 1259);
    			attr_dev(ul1, "class", "list-unstyled");
    			add_location(ul1, file, 36, 3, 1140);
    			add_location(hr2, file, 42, 3, 1363);
    			attr_dev(h22, "class", "svelte-15tcqce");
    			add_location(h22, file, 43, 3, 1371);
    			attr_dev(a1, "href", "https://www.nsf.gov/awardsearch/showAward?AWD_ID=2038922&HistoricalAwards=false");
    			add_location(a1, file, 45, 8, 1436);
    			add_location(li5, file, 45, 4, 1432);
    			attr_dev(a2, "href", "https://utorii.com/gate/");
    			add_location(a2, file, 46, 8, 1555);
    			add_location(li6, file, 46, 4, 1551);
    			attr_dev(a3, "href", "https://smartway.tn.gov/");
    			add_location(a3, file, 47, 8, 1624);
    			add_location(li7, file, 47, 4, 1620);
    			attr_dev(a4, "href", "https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov");
    			add_location(a4, file, 48, 8, 1690);
    			add_location(li8, file, 48, 4, 1686);
    			attr_dev(a5, "href", "https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpooling-system-among-single-occupancy");
    			add_location(a5, file, 49, 8, 1841);
    			add_location(li9, file, 49, 4, 1837);
    			attr_dev(ul2, "class", "list-unstyled");
    			add_location(ul2, file, 44, 3, 1401);
    			add_location(hr3, file, 53, 3, 2001);
    			attr_dev(h23, "class", "svelte-15tcqce");
    			add_location(h23, file, 54, 3, 2009);
    			attr_dev(a6, "href", "https://journals.sagepub.com/doi/abs/10.1177/03611981221094569");
    			add_location(a6, file, 56, 8, 2083);
    			add_location(li10, file, 56, 4, 2079);
    			add_location(br0, file, 58, 4, 2327);
    			attr_dev(a7, "href", "https://escholarship.org/uc/item/9c749361");
    			add_location(a7, file, 59, 8, 2340);
    			add_location(li11, file, 59, 4, 2336);
    			add_location(br1, file, 61, 4, 2523);
    			attr_dev(a8, "href", "https://arxiv.org/abs/2301.12036");
    			add_location(a8, file, 62, 8, 2536);
    			add_location(li12, file, 62, 4, 2532);
    			add_location(br2, file, 63, 4, 2736);
    			attr_dev(a9, "href", "https://ncst.ucdavis.edu/project/evaluating-sustainability-impacts-intelligent-carpoolingvanpooling-system-among-sov");
    			add_location(a9, file, 64, 8, 2749);
    			add_location(li13, file, 64, 4, 2745);
    			add_location(br3, file, 65, 4, 3021);
    			attr_dev(ul3, "class", "list-unstyled");
    			add_location(ul3, file, 55, 3, 2048);
    			add_location(hr4, file, 67, 3, 3038);
    			attr_dev(h24, "id", "Skillsets");
    			attr_dev(h24, "class", "svelte-15tcqce");
    			add_location(h24, file, 69, 3, 3047);
    			add_location(li14, file, 71, 4, 3118);
    			add_location(li15, file, 72, 4, 3196);
    			add_location(li16, file, 73, 4, 3284);
    			attr_dev(ul4, "class", "list-unstyled");
    			add_location(ul4, file, 70, 3, 3087);
    			add_location(hr5, file, 75, 3, 3375);
    			attr_dev(h25, "id", "Applications");
    			attr_dev(h25, "class", "svelte-15tcqce");
    			add_location(h25, file, 77, 3, 3384);
    			add_location(li17, file, 79, 4, 3469);
    			add_location(li18, file, 80, 4, 3538);
    			add_location(li19, file, 81, 4, 3622);
    			attr_dev(ul5, "class", "list-unstyled");
    			add_location(ul5, file, 78, 3, 3438);
    			add_location(hr6, file, 83, 3, 3692);
    			attr_dev(h26, "id", "Tutorial");
    			attr_dev(h26, "class", "svelte-15tcqce");
    			add_location(h26, file, 85, 3, 3701);
    			add_location(li20, file, 88, 4, 3858);
    			add_location(li21, file, 89, 4, 3886);
    			add_location(li22, file, 90, 4, 3918);
    			attr_dev(ul6, "class", "list-unstyled");
    			add_location(ul6, file, 87, 3, 3827);
    			add_location(hr7, file, 92, 3, 3954);
    			attr_dev(div3, "data-bs-spy", "scroll");
    			attr_dev(div3, "data-bs-target", "#navbar-example2");
    			attr_dev(div3, "data-bs-offset", "0");
    			attr_dev(div3, "class", "scrollspy-example col-md-8");
    			attr_dev(div3, "tabindex", "0");
    			add_location(div3, file, 18, 2, 507);
    			attr_dev(div4, "class", "col-md-4");
    			add_location(div4, file, 95, 2, 3971);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file, 16, 1, 430);
    			attr_dev(main, "class", "svelte-15tcqce");
    			add_location(main, file, 15, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div5);
    			append_dev(div5, div3);
    			append_dev(div3, hr0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t3);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t5);
    			append_dev(ul0, li1);
    			append_dev(li1, t6);
    			append_dev(li1, a0);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div3, t9);
    			append_dev(div3, hr1);
    			append_dev(div3, t10);
    			append_dev(div3, h21);
    			append_dev(div3, t12);
    			append_dev(div3, ul1);
    			append_dev(ul1, li2);
    			append_dev(ul1, t14);
    			append_dev(ul1, li3);
    			append_dev(ul1, t16);
    			append_dev(ul1, li4);
    			append_dev(div3, t18);
    			append_dev(div3, hr2);
    			append_dev(div3, t19);
    			append_dev(div3, h22);
    			append_dev(div3, t21);
    			append_dev(div3, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, a1);
    			append_dev(ul2, t23);
    			append_dev(ul2, li6);
    			append_dev(li6, a2);
    			append_dev(ul2, t25);
    			append_dev(ul2, li7);
    			append_dev(li7, a3);
    			append_dev(ul2, t27);
    			append_dev(ul2, li8);
    			append_dev(li8, a4);
    			append_dev(ul2, t29);
    			append_dev(ul2, li9);
    			append_dev(li9, a5);
    			append_dev(div3, t31);
    			append_dev(div3, hr3);
    			append_dev(div3, t32);
    			append_dev(div3, h23);
    			append_dev(div3, t34);
    			append_dev(div3, ul3);
    			append_dev(ul3, li10);
    			append_dev(li10, a6);
    			append_dev(ul3, t36);
    			append_dev(ul3, br0);
    			append_dev(ul3, t37);
    			append_dev(ul3, li11);
    			append_dev(li11, a7);
    			append_dev(ul3, t39);
    			append_dev(ul3, br1);
    			append_dev(ul3, t40);
    			append_dev(ul3, li12);
    			append_dev(li12, a8);
    			append_dev(ul3, t42);
    			append_dev(ul3, br2);
    			append_dev(ul3, t43);
    			append_dev(ul3, li13);
    			append_dev(li13, a9);
    			append_dev(ul3, t45);
    			append_dev(ul3, br3);
    			append_dev(div3, t46);
    			append_dev(div3, hr4);
    			append_dev(div3, t47);
    			append_dev(div3, h24);
    			append_dev(div3, t49);
    			append_dev(div3, ul4);
    			append_dev(ul4, li14);
    			append_dev(ul4, t51);
    			append_dev(ul4, li15);
    			append_dev(ul4, t53);
    			append_dev(ul4, li16);
    			append_dev(div3, t55);
    			append_dev(div3, hr5);
    			append_dev(div3, t56);
    			append_dev(div3, h25);
    			append_dev(div3, t58);
    			append_dev(div3, ul5);
    			append_dev(ul5, li17);
    			append_dev(ul5, t60);
    			append_dev(ul5, li18);
    			append_dev(ul5, t62);
    			append_dev(ul5, li19);
    			append_dev(div3, t64);
    			append_dev(div3, hr6);
    			append_dev(div3, t65);
    			append_dev(div3, h26);
    			append_dev(div3, t67);
    			append_dev(div3, ul6);
    			append_dev(ul6, li20);
    			append_dev(ul6, t69);
    			append_dev(ul6, li21);
    			append_dev(ul6, t71);
    			append_dev(ul6, li22);
    			append_dev(div3, t73);
    			append_dev(div3, hr7);
    			append_dev(div5, t74);
    			append_dev(div5, div4);
    			mount_component(rightbar, div4, null);
    			insert_dev(target, t75, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*activeItem*/ 1) header_changes.activeItem = /*activeItem*/ ctx[0];
    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(rightbar.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(rightbar.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(rightbar);
    			if (detaching) detach_dev(t75);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let name = "Diyi Liu's website";
    	let items = ["Bio", "Research", "Skillsets", "Applications", "Tutorial"];
    	let activeItem = "Bio";

    	const tabChange = e => {
    		$$invalidate(0, activeItem = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		Rightbar,
    		name,
    		items,
    		activeItem,
    		tabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) name = $$props.name;
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, items, tabChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
