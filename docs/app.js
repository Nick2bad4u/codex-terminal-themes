/**
 * @typedef {{
 *     readonly colorReferences?: number;
 *     readonly settings?: number;
 *     readonly uniqueScopes?: number;
 * }} ThemeStatistics
 *
 * @typedef {{
 *     readonly background?: string;
 *     readonly fontStyle?: string;
 *     readonly foreground?: string;
 *     readonly scope: string;
 * }} ThemeRule
 *
 * @typedef {{
 *     readonly appearance: string;
 *     readonly author: null | string;
 *     readonly colors: Record<string, null | string>;
 *     readonly fileName: string;
 *     readonly id: string;
 *     readonly name: string;
 *     readonly path: string;
 *     readonly rules: readonly ThemeRule[];
 *     readonly statistics: ThemeStatistics;
 *     readonly uuid: string;
 * }} Theme
 *
 * @typedef {Partial<
 *     Record<"background" | "fontStyle" | "foreground", string>
 * >} MatchedStyle
 *
 * @typedef {{
 *     readonly extension: string;
 *     readonly name: string;
 *     readonly tokens: readonly (readonly [string, string])[];
 * }} Sample
 */

/** @type {readonly Sample[]} */
const samples = [
    {
        extension: "ts",
        name: "TypeScript",
        tokens: [
            ["import", "keyword.control.import.ts"],
            [" { ", "source.ts"],
            ["readFile", "entity.name.function.ts"],
            [" } ", "source.ts"],
            ["from", "keyword.control.import.ts"],
            [' "node:fs/promises"', "string.quoted.double.ts"],
            [";\n\n", "punctuation.terminator.statement.ts"],
            ["type", "storage.type.ts"],
            [" ThemePreview", "entity.name.type.alias.ts"],
            [" = {\n", "keyword.operator.assignment.ts"],
            ["    readonly", "storage.modifier.ts"],
            [" name", "variable.other.property.ts"],
            [": ", "punctuation.separator.key-value.ts"],
            ["string", "support.type.primitive.ts"],
            [";\n", "punctuation.terminator.statement.ts"],
            ["    readonly", "storage.modifier.ts"],
            [" scopes", "variable.other.property.ts"],
            [": ", "punctuation.separator.key-value.ts"],
            ["readonly", "storage.modifier.ts"],
            [" string", "support.type.primitive.ts"],
            ["[];\n};\n\n", "source.ts"],
            ["export", "storage.modifier.ts"],
            [" async", "storage.modifier.async.ts"],
            [" function", "storage.type.function.ts"],
            [" loadTheme", "entity.name.function.ts"],
            ["(", "punctuation.section.parameters.begin.ts"],
            ["id", "variable.parameter.ts"],
            [": ", "punctuation.separator.key-value.ts"],
            ["string", "support.type.primitive.ts"],
            [") {\n", "punctuation.section.parameters.end.ts"],
            ["    const", "storage.type.ts"],
            [" file", "variable.other.readwrite.ts"],
            [" = ", "keyword.operator.assignment.ts"],
            ["await", "keyword.control.flow.ts"],
            [" readFile", "entity.name.function.ts"],
            ["(", "punctuation.section.arguments.begin.ts"],
            ["id", "variable.other.readwrite.ts"],
            [");\n", "punctuation.terminator.statement.ts"],
            ["    return", "keyword.control.flow.ts"],
            [" JSON", "support.class.builtin.ts"],
            [".", "punctuation.accessor.ts"],
            ["parse", "support.function.builtin.ts"],
            ["(", "punctuation.section.arguments.begin.ts"],
            ["file", "variable.other.readwrite.ts"],
            [");\n}", "punctuation.section.block.end.ts"],
        ],
    },
    {
        extension: "ps1",
        name: "PowerShell",
        tokens: [
            ["param", "keyword.control.powershell"],
            ["(\n", "punctuation.section.group.begin.powershell"],
            ["    [", "punctuation.definition.attribute.begin.powershell"],
            ["string", "support.type.powershell"],
            ["]", "punctuation.definition.attribute.end.powershell"],
            [" $Theme", "variable.other.readwrite.powershell"],
            [" = ", "keyword.operator.assignment.powershell"],
            ['"AmoledShinyBlack6"', "string.quoted.double.powershell"],
            ["\n)\n\n", "punctuation.section.group.end.powershell"],
            ["$metadata", "variable.other.readwrite.powershell"],
            [" = ", "keyword.operator.assignment.powershell"],
            ["Get-Content", "support.function.powershell"],
            [" ", "source.powershell"],
            ["metadata/themes.json", "string.unquoted.powershell"],
            [" | ", "keyword.operator.pipe.powershell"],
            ["ConvertFrom-JSON", "support.function.powershell"],
            ["\n\n", "source.powershell"],
            ["foreach", "keyword.control.loop.powershell"],
            [" (", "punctuation.section.group.begin.powershell"],
            ["$item", "variable.other.readwrite.powershell"],
            [" in ", "keyword.operator.word.powershell"],
            ["$metadata", "variable.other.readwrite.powershell"],
            [".themes", "variable.other.member.powershell"],
            [") {\n", "punctuation.section.group.end.powershell"],
            ["    if", "keyword.control.conditional.powershell"],
            [" (", "punctuation.section.group.begin.powershell"],
            ["$item", "variable.other.readwrite.powershell"],
            [".appearance", "variable.other.member.powershell"],
            [" -eq ", "keyword.operator.comparison.powershell"],
            ['"dark"', "string.quoted.double.powershell"],
            [") {\n", "punctuation.section.group.end.powershell"],
            ["        Write-Host", "support.function.powershell"],
            [" ", "source.powershell"],
            ["$item", "variable.other.readwrite.powershell"],
            [".name\n", "variable.other.member.powershell"],
            ["    }\n}", "punctuation.section.block.end.powershell"],
        ],
    },
    {
        extension: "py",
        name: "Python",
        tokens: [
            ["from", "keyword.control.import.python"],
            [" pathlib ", "source.python"],
            ["import", "keyword.control.import.python"],
            [" Path\n\n", "support.type.python"],
            ["class", "storage.type.class.python"],
            [" ThemeIndex", "entity.name.type.class.python"],
            [":\n", "punctuation.separator.colon.python"],
            ["    def", "storage.type.function.python"],
            [" __init__", "entity.name.function.python"],
            ["(", "punctuation.section.parameters.begin.python"],
            [
                "self",
                "variable.parameter.function.language.special.self.python",
            ],
            [", ", "punctuation.separator.parameters.python"],
            ["root", "variable.parameter.function.python"],
            [": ", "punctuation.separator.annotation.python"],
            ["Path", "support.type.python"],
            ["):\n", "punctuation.section.parameters.end.python"],
            ["        self", "variable.language.special.self.python"],
            [".root", "variable.other.property.python"],
            [" = ", "keyword.operator.assignment.python"],
            ["root\n\n", "variable.other.readwrite.python"],
            ["    def", "storage.type.function.python"],
            [" find", "entity.name.function.python"],
            ["(", "punctuation.section.parameters.begin.python"],
            [
                "self",
                "variable.parameter.function.language.special.self.python",
            ],
            [", ", "punctuation.separator.parameters.python"],
            ["query", "variable.parameter.function.python"],
            [": ", "punctuation.separator.annotation.python"],
            ["str", "support.type.python"],
            ["):\n", "punctuation.section.parameters.end.python"],
            ["        return", "keyword.control.flow.python"],
            [" [", "punctuation.definition.list.begin.python"],
            ["theme", "variable.other.readwrite.python"],
            [" for ", "keyword.control.loop.python"],
            ["theme", "variable.other.readwrite.python"],
            [" in ", "keyword.control.loop.python"],
            ["self", "variable.language.special.self.python"],
            [".themes", "variable.other.property.python"],
            [" if ", "keyword.control.conditional.python"],
            ["query", "variable.other.readwrite.python"],
            [".lower", "support.function.builtin.python"],
            ["()", "punctuation.section.arguments.python"],
            [" in ", "keyword.operator.word.python"],
            ["theme", "variable.other.readwrite.python"],
            [".name", "variable.other.property.python"],
            [".lower", "support.function.builtin.python"],
            ["()", "punctuation.section.arguments.python"],
            ["]", "punctuation.definition.list.end.python"],
        ],
    },
    {
        extension: "html",
        name: "HTML CSS",
        tokens: [
            ["<", "punctuation.definition.tag.begin.html"],
            ["section", "entity.name.tag.html"],
            [" class", "entity.other.attribute-name.html"],
            ["=", "punctuation.separator.key-value.html"],
            ['"preview"', "string.quoted.double.html"],
            [">\n", "punctuation.definition.tag.end.html"],
            ["    <", "punctuation.definition.tag.begin.html"],
            ["h2", "entity.name.tag.html"],
            [">", "punctuation.definition.tag.end.html"],
            ["Amoled preview", "text.html.basic"],
            ["</", "punctuation.definition.tag.begin.html"],
            ["h2", "entity.name.tag.html"],
            [">\n", "punctuation.definition.tag.end.html"],
            ["    <", "punctuation.definition.tag.begin.html"],
            ["style", "entity.name.tag.html"],
            [">\n", "punctuation.definition.tag.end.html"],
            ["        .preview", "entity.other.attribute-name.class.css"],
            [" {\n", "punctuation.section.property-list.begin.css"],
            ["            color", "support.type.property-name.css"],
            [": ", "punctuation.separator.key-value.css"],
            ["#8fd3c7", "constant.other.color.rgb-value.css"],
            [";\n", "punctuation.terminator.rule.css"],
            ["            background", "support.type.property-name.css"],
            [": ", "punctuation.separator.key-value.css"],
            ["black", "support.constant.color.w3c-standard-color-name.css"],
            [";\n        }\n", "punctuation.terminator.rule.css"],
            ["    </", "punctuation.definition.tag.begin.html"],
            ["style", "entity.name.tag.html"],
            [">\n", "punctuation.definition.tag.end.html"],
            ["</", "punctuation.definition.tag.begin.html"],
            ["section", "entity.name.tag.html"],
            [">", "punctuation.definition.tag.end.html"],
        ],
    },
];

/**
 * @type {{
 *     appearance: string;
 *     query: string;
 *     selectedId: string;
 *     themes: Theme[];
 * }}
 */
const state = {
    appearance: "all",
    query: "",
    selectedId: "",
    themes: [],
};

const elements = {
    appearanceFilter: queryElement("#appearance_filter", HTMLSelectElement),
    codeGrid: queryElement("#code_grid", HTMLElement),
    metadataStrip: queryElement("#metadata_strip", HTMLElement),
    scopeCount: queryElement("#scope_count", HTMLElement),
    search: queryElement("#theme_search", HTMLInputElement),
    selectedAppearance: queryElement("#selected_appearance", HTMLElement),
    selectedName: queryElement("#selected_name", HTMLElement),
    terminalFrame: queryElement("#terminal_frame", HTMLElement),
    themeCount: queryElement("#theme_count", HTMLElement),
    themeDownload: queryElement("#theme_download", HTMLAnchorElement),
    themeList: queryElement("#theme_list", HTMLElement),
};

/**
 * @param {HTMLElement} parent
 * @param {string} className
 * @param {string} text
 *
 * @returns {HTMLElement}
 */
function appendElement(parent, className, text) {
    const element = document.createElement("span");
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

/**
 * @param {unknown} color
 * @param {string} fallback
 *
 * @returns {string}
 */
function colorOrFallback(color, fallback) {
    return typeof color === "string" && color.length > 0 ? color : fallback;
}

/**
 * @param {string} fontStyle
 *
 * @returns {string}
 */
function fontStyleClass(fontStyle) {
    return fontStyle
        .split(" ")
        .filter((part) =>
            [
                "bold",
                "italic",
                "underline",
            ].includes(part)
        )
        .join(" ");
}

/**
 * @returns {readonly Theme[]}
 */
function getFilteredThemes() {
    const queryParts = state.query
        .toLowerCase()
        .split(/\s+/v)
        .filter((part) => part.length > 0);

    return state.themes.filter((theme) => {
        const matchesAppearance =
            state.appearance === "all" || theme.appearance === state.appearance;
        const searchText = [
            theme.name,
            theme.fileName,
            theme.author,
            theme.appearance,
            theme.path,
            theme.uuid,
        ]
            .join(" ")
            .toLowerCase();
        const matchesQuery = queryParts.every((part) =>
            searchText.includes(part)
        );

        return matchesAppearance && matchesQuery;
    });
}

/**
 * @param {Theme} theme
 *
 * @returns {Record<string, string>}
 */
function getThemeColors(theme) {
    return {
        background: colorOrFallback(theme.colors.background, "#101418"),
        foreground: colorOrFallback(theme.colors.foreground, "#e8edf3"),
        lineHighlight: colorOrFallback(theme.colors.lineHighlight, "#ffffff10"),
        selection: colorOrFallback(theme.colors.selection, "#8fd3c766"),
    };
}

/**
 * @param {Theme} theme
 *
 * @returns {readonly ThemeRule[]}
 */
function getThemeRules(theme) {
    return theme.rules;
}

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @template {Element} T
 *
 * @param {string} selector
 * @param {new (...arguments_: never[]) => T} constructor
 *
 * @returns {T}
 */
function queryElement(selector, constructor) {
    const element = document.querySelector(selector);

    if (element instanceof constructor) {
        return element;
    }

    throw new TypeError(`Missing required element: ${selector}`);
}

/**
 * @param {unknown} value
 *
 * @returns {Record<string, null | string>}
 */
function readColors(value) {
    if (!isRecord(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => [
            key,
            typeof entryValue === "string" ? entryValue : null,
        ])
    );
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {null | string}
 */
function readNullableString(record, key) {
    const value = record[key];
    return typeof value === "string" ? value : null;
}

/**
 * @param {unknown} value
 *
 * @returns {readonly ThemeRule[]}
 */
function readRules(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((entry) => isRecord(entry))
        .flatMap((entry) => {
            const scope = readString(entry, "scope");

            if (scope.length === 0) {
                return [];
            }

            return [
                {
                    ...(readString(entry, "background").length === 0
                        ? {}
                        : { background: readString(entry, "background") }),
                    ...(readString(entry, "fontStyle").length === 0
                        ? {}
                        : { fontStyle: readString(entry, "fontStyle") }),
                    ...(readString(entry, "foreground").length === 0
                        ? {}
                        : { foreground: readString(entry, "foreground") }),
                    scope,
                },
            ];
        });
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {string}
 */
function readString(record, key) {
    const value = record[key];
    return typeof value === "string" ? value : "";
}

/**
 * @param {unknown} value
 *
 * @returns {ThemeStatistics}
 */
function readStatistics(value) {
    if (!isRecord(value)) {
        return {};
    }

    return {
        colorReferences:
            typeof value.colorReferences === "number"
                ? value.colorReferences
                : 0,
        settings: typeof value.settings === "number" ? value.settings : 0,
        uniqueScopes:
            typeof value.uniqueScopes === "number" ? value.uniqueScopes : 0,
    };
}

/**
 * @param {unknown} data
 *
 * @returns {Theme[]}
 */
function readThemes(data) {
    if (!isRecord(data) || !Array.isArray(data.themes)) {
        return [];
    }

    return data.themes
        .filter((entry) => isRecord(entry))
        .map((entry) => ({
            appearance: readString(entry, "appearance"),
            author: readNullableString(entry, "author"),
            colors: readColors(entry.colors),
            fileName: readString(entry, "fileName"),
            id: readString(entry, "id"),
            name: readString(entry, "name"),
            path: readString(entry, "path"),
            rules: readRules(entry.rules),
            statistics: readStatistics(entry.statistics),
            uuid: readString(entry, "uuid"),
        }));
}

/**
 * @param {readonly ThemeRule[]} rules
 * @param {string} tokenScope
 *
 * @returns {MatchedStyle}
 */
function matchStyle(rules, tokenScope) {
    /** @type {MatchedStyle} */
    const style = {};
    /** @type {Record<string, number>} */
    const scores = {};

    for (const rule of rules) {
        const selector = rule.scope;

        if (typeof selector !== "string") {
            continue;
        }

        const score = selectorScore(selector, tokenScope);

        if (score <= 0) {
            continue;
        }

        for (const key of [
            "background",
            "fontStyle",
            "foreground",
        ]) {
            const value =
                key === "background"
                    ? rule.background
                    : key === "fontStyle"
                      ? rule.fontStyle
                      : rule.foreground;

            if (
                typeof value === "string" &&
                value.length > 0 &&
                score >= (scores[key] ?? 0)
            ) {
                style[key] = value;
                scores[key] = score;
            }
        }
    }

    return style;
}

/**
 * @param {Theme} theme
 */
function renderMetadata(theme) {
    const { statistics } = theme;
    const metadata = [
        theme.appearance,
        `${statistics.settings ?? 0} settings`,
        `${statistics.uniqueScopes ?? 0} scopes`,
        `${statistics.colorReferences ?? 0} colors`,
        theme.author ?? "unknown author",
    ];

    elements.metadataStrip.replaceChildren();

    for (const item of metadata) {
        appendElement(elements.metadataStrip, "metadata-pill", item);
    }
}

function renderThemeList() {
    const filteredThemes = getFilteredThemes();
    elements.themeList.replaceChildren();

    for (const theme of filteredThemes) {
        const colors = getThemeColors(theme);
        const button = document.createElement("button");
        button.className = "theme-option";
        button.type = "button";
        button.setAttribute("role", "option");
        button.setAttribute(
            "aria-selected",
            String(theme.id === state.selectedId)
        );
        button.addEventListener("click", () => {
            state.selectedId = theme.id;
            render();
        });

        const swatch = document.createElement("span");
        swatch.className = "swatch";
        swatch.style.background = `linear-gradient(135deg, ${colors.background}, ${colors.selection})`;

        const text = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = theme.name;
        const meta = document.createElement("span");
        meta.textContent = `${theme.appearance} / ${theme.fileName}`;

        text.append(name, meta);
        button.append(swatch, text);
        elements.themeList.append(button);
    }

    if (filteredThemes.length === 0) {
        appendElement(elements.themeList, "metadata-pill", "No themes match");
    }
}

/**
 * @param {Theme} theme
 */
function renderThemePreview(theme) {
    const colors = getThemeColors(theme);
    const rules = getThemeRules(theme);

    elements.selectedName.textContent = theme.name;
    elements.selectedAppearance.textContent = `${theme.appearance} theme`;
    elements.themeDownload.href = `../${theme.path}`;
    elements.terminalFrame.style.backgroundColor = colors.background;
    renderMetadata(theme);
    elements.codeGrid.replaceChildren();

    for (const sample of samples) {
        const sampleElement = document.createElement("section");
        sampleElement.className = "code-sample";
        sampleElement.style.backgroundColor = colors.background;
        sampleElement.style.color = colors.foreground;

        const title = document.createElement("div");
        title.className = "sample-title";
        const sampleName = document.createElement("span");
        sampleName.textContent = sample.name;
        const sampleExtension = document.createElement("span");
        sampleExtension.textContent = sample.extension;
        title.append(sampleName, sampleExtension);

        const pre = document.createElement("pre");
        pre.style.color = colors.foreground;

        for (const [text, scope] of sample.tokens) {
            const token = document.createElement("span");
            const style = matchStyle(rules, scope);
            token.className = `token ${fontStyleClass(style.fontStyle ?? "")}`;
            token.textContent = text;

            if (style.foreground !== undefined) {
                token.style.color = style.foreground;
            }

            if (style.background !== undefined) {
                token.style.backgroundColor = style.background;
            }

            pre.append(token);
        }

        sampleElement.append(title, pre);
        elements.codeGrid.append(sampleElement);
    }
}

function render() {
    const filteredThemes = getFilteredThemes();

    if (
        state.selectedId.length === 0 ||
        !filteredThemes.some((theme) => theme.id === state.selectedId)
    ) {
        state.selectedId =
            filteredThemes.length > 0 ? filteredThemes[0].id : "";
    }

    renderThemeList();

    const selectedTheme = state.themes.find(
        (theme) => theme.id === state.selectedId
    );

    if (selectedTheme !== undefined) {
        renderThemePreview(selectedTheme);
    }
}

/**
 * @param {string} selector
 * @param {string} tokenScope
 *
 * @returns {number}
 */
function selectorScore(selector, tokenScope) {
    const selectorParts = selector.split(/\s+/v);
    const selectorTarget = selectorParts.at(-1) ?? selector;

    if (tokenScope === selectorTarget) {
        return 1000 + selectorTarget.length;
    }

    if (tokenScope.startsWith(`${selectorTarget}.`)) {
        return 500 + selectorTarget.length;
    }

    const scopeParts = tokenScope.split(".");
    const selectorSegments = selectorTarget.split(".");
    const matchesPrefix = selectorSegments.every(
        (segment, index) => scopeParts[index] === segment
    );

    return matchesPrefix ? 100 + selectorTarget.length : 0;
}

async function start() {
    const response = await fetch("site-data.json");
    const data = /** @type {unknown} */ (await response.json());
    state.themes = readThemes(data);

    const allScopes = new Set(
        state.themes.flatMap((theme) => theme.rules.map((rule) => rule.scope))
    );

    elements.themeCount.textContent = `${state.themes.length} themes`;
    elements.scopeCount.textContent = `${allScopes.size} styled scopes`;
    render();
}

elements.search.addEventListener("input", (event) => {
    const target = event.target;
    state.query = target instanceof HTMLInputElement ? target.value : "";
    render();
});

elements.appearanceFilter.addEventListener("change", (event) => {
    const target = event.target;
    state.appearance =
        target instanceof HTMLSelectElement ? target.value : "all";
    render();
});

void start();
