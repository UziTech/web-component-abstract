# web-component-abstract
Abstract class for creating web components with attributes bound to state.

## Install

```sh
npm install --save web-component-abstract
```

## Usage

JavaScript:
```js
const Component = require("web-component-abstract");

class Hello extends Component({name: "World"}) {
	styles() {
		return "./style.css";
	}
	render() {
		const element = document.createElement("div");
		element.textContent = `Hello ${this.state.name}`;
		return element;
	}
}
Hello.define("my-hello");
```

HTML:
```html
<my-hello name="Web Components"></my-hello>
```

Output:
Hello Web Components
