import { asWebGenComponent, Component, HTMLComponent } from "../components.ts";
import { alwaysRef, Reference } from "../state.ts";

@asWebGenComponent("full-width-section")
class FullWidthSectionComponent extends HTMLComponent {
    constructor(
        components: Component[]
    ) {
        super();

        this.style.display = "grid";
        this.style.gridTemplateColumns = "inherit";
        this.style.gridColumn = "full-width";

        for (const iterator of components) {
            const item = iterator.draw();
            item.style.gridColumn = "full-width";
            this.append(item);
        }
    }
}
export const FullWidthSection = (...elements: Component[]) => new FullWidthSectionComponent(elements).make();

@asWebGenComponent("content")
export class ContentComponent extends HTMLComponent {
    constructor(component: Reference<Component[] | Component> | Component, components: Component[]) {
        super();
        this.style.display = "grid";

        this.style.setProperty("--content-padding", "16px");
        this.style.gridTemplateColumns = [
            "[full-width-start]",
            "minmax(var(--content-padding), 1fr)",
            "[content-start]",
            "min(100% - (var(--content-padding) * 2), var(--content-max-width, 900px))",
            "[content-end]",
            "minmax(var(--content-padding), 1fr)",
            "[full-width-end]",
        ].join(" ");
        this.style.alignContent = "start";

        this.useListener(alwaysRef(component), (current, oldValue) => {
            if (oldValue) {
                for (const iterator of Array.isArray(oldValue) ? oldValue : [ oldValue ]) {
                    const item = iterator.draw();
                    item.remove();
                }
            }
            for (const iterator of Array.isArray(current) ? current.reverse() : [ current ]) {
                const item = iterator.draw();
                if (item instanceof FullWidthSectionComponent) {
                    this.shadowRoot!.prepend(...Array.from(item.children));
                } else {
                    item.style.gridColumn = "content";
                    this.shadowRoot!.prepend(item);
                }
            }
        });

        for (const iterator of components) {
            const item = iterator.draw();
            if (item instanceof FullWidthSectionComponent) {
                this.shadowRoot!.append(...Array.from(item.children));
            } else {
                item.style.gridColumn = "content";
                this.shadowRoot!.append(item);
            }
        }
    }

    override make() {
        const obj = {
            ...super.make(),
            setContentMaxWidth: (size: string) => {
                this.style.setProperty("--content-max-width", size);
                return obj;
            },
            setContentPadding: (size: string) => {
                this.style.setProperty("--content-padding", size);
                return obj;
            },
            fillHeight: () => {
                this.style.marginBlockEnd = "auto";
                return obj;
            }
        };
        return obj;
    }
}

export const Content = (component: Reference<Component[] | Component> | Component, ...components: Component[]) => new ContentComponent(component, components).make();
