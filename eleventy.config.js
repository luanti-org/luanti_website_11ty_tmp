import path from "path";

import UserConfig from "@11ty/eleventy";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";


/**
 * @param {UserConfig} eleventyConfig
 * @returns {void}
 */
export default function (eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
	});

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("public/**/*.{svg,webp,png,jpeg}");

	// Official plugins
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Customize Markdown library settings:
	let mdLibSave = null;
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLibSave = mdLib;
		mdLib.set({
			typographer: true,
		});
	});

	eleventyConfig.addFilter("md", function (content = "") {
		return mdLibSave.render(content);
	});

	eleventyConfig.addLayoutAlias("base", "layouts/base.html");

	eleventyConfig.addFilter("absolute_url",
		(x) => new URL(x, "https://www.luanti.org").toString());

	eleventyConfig.addShortcode("error", async (...messages) => {
		throw new Error(messages.join(""));
	});
}

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"html",
		"liquid",
		"11ty.js",
	],

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes"
		data: "../_data",          // default: "_data"
		output: "_site"
	},
};
