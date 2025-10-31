import UserConfig from "@11ty/eleventy";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { I18nPlugin } from "@11ty/eleventy";
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import YAML from "yaml";
import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import iso639 from "iso-639-1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {UserConfig} eleventyConfig
 * @returns {void}
 */
export default function (eleventyConfig) {
	i18next.use(Backend).init({
		initAsync: false,
		lng: "en",
		// debug: true,

		saveMissing: true,

		// allow keys to be phrases having `:`, `.`
		nsSeparator: false,
		keySeparator: false,

		// do not load a fallback
		fallbackLng: "en",

		backend: {
			loadPath: join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
			addPath: join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
		},

		preload: readdirSync(join(__dirname, 'locales')).filter((fileName) => {
			const joinedPath = join(join(__dirname, 'locales'), fileName)
			const isDirectory = lstatSync(joinedPath).isDirectory()
			return isDirectory;
		}),
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
	});

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("public/**/*.{svg,webp,png,jpeg}");

	// Official plugins
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(I18nPlugin, {
		defaultLanguage: "en",
	});

	eleventyConfig.addDataExtension("yml,yaml", (contents) => YAML.parse(contents));

	const md = markdownIt({
		html: true,
		breaks: true,
		linkify: true,
		typographer: true
	});
	eleventyConfig.setLibrary("md", md);

	eleventyConfig.addFilter("markdownify", function (content = "") {
		return md.render(content);
	});

	eleventyConfig.addLayoutAlias("base", "layouts/base.html");
	eleventyConfig.addLayoutAlias("page_subtitle", "layouts/page_subtitle.html");

	eleventyConfig.addFilter("absolute_url",
		(x) => new URL(x, "https://www.luanti.org").toString());

	eleventyConfig.addShortcode("error", async (...messages) => {
		throw new Error(messages.join(""));
	});

	eleventyConfig.addFilter("format_date", async function(date) {
		return DateTime.fromJSDate(new Date(date)).toUTC().toLocaleString(DateTime.DATE_FULL, {
			locale: this.page.lang ?? "en",
		});
	});

	eleventyConfig.addFilter("i18n", function(msg) {
		const lang = this.page.lang ?? "en";
		// return lang;
		return i18next.getFixedT(lang)(msg);
	});

	eleventyConfig.addFilter("langName", function(langCode) {
		return iso639.getNativeName(langCode.split("-")[0]);
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
