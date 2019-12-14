import './vendor/turnjs/turn.js';
import HomePage from './HomePage.svelte';

const homePage = new HomePage({
	target: document.body,
});

export default homePage;