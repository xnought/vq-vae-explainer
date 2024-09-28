import { writable } from "svelte/store";
import { generateDiscreteColors } from "./color";
import { numEmbed } from "./load";
import * as d3 from "d3";

export const hovering = writable();
export const codeNames = "0123456789ABCDEFGHIJ";
export const codeColors = generateDiscreteColors(
	numEmbed,
	d3.interpolateCool,
	0,
	0.2
);
