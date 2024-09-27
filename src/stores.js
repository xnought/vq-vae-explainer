import { writable } from "svelte/store";
import { generateDiscreteColors } from "./color";
import * as d3 from "d3";

export const hovering = writable();
export const codeNames = "0123456789ABCDEF";
export const codeColors = generateDiscreteColors(
	16,
	d3.interpolateCool,
	0,
	0.2
);
