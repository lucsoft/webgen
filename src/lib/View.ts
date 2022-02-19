import { createElement } from "../components/Components.ts";
import type { Component, ViewOptions, ViewOptionsFunc } from "../types.ts";
import '../css/cards.webgen.static.css';
import { Custom } from "../components/generic/Custom.ts";
export type ViewData = {
    setMaxWidth: (maxWidth: string) => ViewData
    addClass: (...classes: string[]) => ViewData
    enableCenterFromMiddle: () => ViewData
    appendOn: (component: HTMLElement) => ViewData
    unsafeViewOptions: <StateType>() => ViewOptions<StateType>
}
export function View<State>(render: ViewOptionsFunc<State>): ViewData {
    let appendOnElement: HTMLElement | null = null;
    let hasMaxWidth: string | null = null;
    const cssClasses: string[] = [];
    let activeCompnents: Component[] = [];
    let shell = createElement('article')
    const state = {} as State;
    const renderFunction = () => {
        const data = render({
            state,
            update: (data) => {
                Object.assign(state, data);
                renderFunction();
            },
            use: (comp) => activeCompnents.push(comp)
        })
        if (data) activeCompnents.push(data);
        const newShell = createElement('article');
        if (hasMaxWidth) {
            newShell.classList.add('maxWidth');
            newShell.style.maxWidth = hasMaxWidth;
        }
        newShell.classList.add(...cssClasses);
        newShell.append(...activeCompnents.map(x => x.draw()));
        appendOnElement?.replaceChild(newShell, shell);
        activeCompnents = [];
        shell = newShell;
    };

    const options = {
        setMaxWidth: (maxWidth: string) => {
            hasMaxWidth = maxWidth;
            if (appendOnElement) renderFunction();
            return options;
        },
        unsafeViewOptions: <State>(): ViewOptions<State> => ({
            state,
            update: (data) => {
                Object.assign(state, data);
                renderFunction();
            },
            use: (comp) => activeCompnents.push(comp)
        }),
        addClass: (...classes: string[]) => {
            cssClasses.push(...classes);
            if (appendOnElement) renderFunction();
            return options;
        },
        enableCenterFromMiddle: () => {
            cssClasses.push("flex-center");
            if (appendOnElement) renderFunction();
            return options;
        },
        asCommponent: () => {
            return Custom(shell);
        },
        appendOn: (component: HTMLElement) => {
            if (appendOnElement != null) throw new Error("appendOn can only be used once");

            appendOnElement = component;
            component.append(shell);
            renderFunction();
            return options;
        }
    }
    return options;
}