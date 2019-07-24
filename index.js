/**
 * Abstract class for Web Components
 *
 * @param  {Object} [attributes={}] Synced attributes and defaults
 * @return {Component} [description]
 */

module.exports = function (attributes = {}) {

	class Component extends HTMLElement {
		constructor() {
			super();

			this.defaults = attributes;

			this.attachShadow({mode: "open"});

			const initialState = {};
			for (const attr in attributes) {
				if (this.hasAttribute(attr)) {
					if (typeof attributes[attr] === "boolean") {
						initialState[attr] = true;
					} else if (typeof attributes[attr] === "string") {
						initialState[attr] = this.getAttribute(attr);
					} else {
						initialState[attr] = JSON.parse(this.getAttribute(attr));
					}
				} else {
					initialState[attr] = attributes[attr];
				}
			}

			this.state = initialState;
		}

		setStylesheet(stylesheet) {
			if (this.stylesheet && stylesheet && stylesheet !== this.stylesheet && this.shadowRoot.contains(this.stylesheet)) {
				this.shadowRoot.removeChild(this.stylesheet);
			}
			if (stylesheet && stylesheet !== this.stylesheet) {
				this.stylesheet = stylesheet;
				this.shadowRoot.insertBefore(this.stylesheet, this.shadowRoot.firstChild);
			} else if (this.stylesheet && !this.shadowRoot.contains(this.stylesheet)) {
				this.shadowRoot.insertBefore(this.stylesheet, this.shadowRoot.firstChild);
			}
		}

		setElement(element) {
			if (this.element && element && element !== this.element && this.shadowRoot.contains(this.element)) {
				this.shadowRoot.removeChild(this.element);
			}
			if (element && element !== this.element) {
				this.element = element;
				this.shadowRoot.appendChild(this.element);
			} else if (this.element && !this.shadowRoot.contains(this.element)) {
				this.shadowRoot.appendChild(this.element);
			}
		}

		async connectedCallback() {
			this.connected = true;
			if (this.initialConnected) {
				return;
			}
			this.initialConnected = true;

			await this.setState(this.state);

			if (this.styles && !this.stylesheet) {
				let styles = this.styles;
				if (styles.includes("{")) {
					const indent = styles.match(/^\n*([ \t]*)/)[1];
					styles = styles.trimStart().split("\n").map(line => {
						return line.replace(new RegExp(`^${indent}`), "").trimEnd();
					}).join("\n");
					this.stylesheet = document.createElement("style");
					this.stylesheet.textContent = styles;
				} else {
					this.stylesheet = document.createElement("link");
					this.stylesheet.setAttribute("rel", "stylesheet");
					this.stylesheet.setAttribute("href", styles);
				}
			}
			this.setStylesheet();

			if (this.render && !this.element) {
				this.element = await this.render();
			}
			this.setElement();
		}

		disconnectedCallback() {
			this.connected = false;
		}

		static get observedAttributes() {
			return Object.keys(attributes);
		}

		attributeChangedCallback(prop, oldValue, newValue) {
			if (typeof attributes[prop] === "boolean") {
				if (this.state[prop] !== (newValue !== null)) {
					this.setState({[prop]: newValue !== null});
				}
			} else if (typeof attributes[prop] === "string") {
				if (this.state[prop] !== newValue) {
					this.setState({[prop]: newValue});
				}
			} else {
				if (JSON.stringify(this.state[prop]) !== newValue) {
					this.setState({[prop]: JSON.parse(newValue)});
				}
			}
		}

		static define(name) {
			customElements.define(name, this);
		}

		async setState(newProps) {
			if (newProps) {
				for (const prop in newProps) {
					if (prop in attributes) {
						const newValue = newProps[prop];
						if (typeof attributes[prop] === "boolean") {
							const hasAttr = this.hasAttribute(prop);
							if (hasAttr && !newValue) {
								this.removeAttribute(prop);
							} else if (!hasAttr && newValue) {
								this.setAttribute(prop, "");
							}
						} else if (typeof attributes[prop] === "string") {
							if (this.getAttribute(prop) !== newValue) {
								this.setAttribute(prop, newValue);
							}
						} else {
							const sValue = JSON.stringify(newValue);
							if (this.getAttribute(prop) !== sValue) {
								this.setAttribute(prop, sValue);
							}
						}
					}
				}

				this.state = {
					...this.state,
					...newProps,
				};
			}

			if (this.element) {
				await this.update();
			}
		}

		async update() {
			this.setElement(await this.render());
		}
	}

	return Component;
};
