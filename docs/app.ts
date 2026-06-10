type ThemeStatistics = {
    readonly colorReferences?: number;
    readonly settings?: number;
    readonly uniqueScopes?: number;
};

type ThemeRule = {
    readonly background?: string;
    readonly fontStyle?: string;
    readonly foreground?: string;
    readonly scope: string;
};

type Theme = {
    readonly appearance: string;
    readonly author: null | string;
    readonly colors: Record<string, null | string>;
    readonly fileName: string;
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly rules: readonly ThemeRule[];
    readonly statistics: ThemeStatistics;
    readonly uuid: string;
};

type ColorRgb = {
    readonly b: number;
    readonly g: number;
    readonly r: number;
};

type ColorHsl = {
    readonly hue: number;
    readonly lightness: number;
    readonly saturation: number;
};

type MatchedStyle = Partial<
    Record<"background" | "fontStyle" | "foreground", string>
>;

type Sample = {
    readonly extension: string;
    readonly name: string;
    readonly tokens: readonly (readonly [string, string])[];
};

type GalleryState = {
    appearance: string;
    colorEnabled: boolean;
    colorHex: string;
    hue: string;
    query: string;
    selectedId: string;
    themes: Theme[];
};

type ColorRenderOptions = {
    readonly renderMode?: "defer" | "none" | "now";
};

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
 *     colorEnabled: boolean;
 *     colorHex: string;
 *     hue: string;
 *     query: string;
 *     selectedId: string;
 *     themes: Theme[];
 * }}
 */
const state: GalleryState = {
    appearance: "all",
    colorEnabled: false,
    colorHex: "#69d6c6",
    hue: "all",
    query: "",
    selectedId: "",
    themes: [],
};

const colorRenderDelayMs = 140;

/** @type {readonly ("background" | "fontStyle" | "foreground")[]} */
const styleKeys = [
    "background",
    "fontStyle",
    "foreground",
];

/** @type {ReturnType<typeof globalThis.setTimeout> | 0} */
let colorRenderTimer: ReturnType<typeof globalThis.setTimeout> | 0 = 0;

const elements = {
    appearanceFilter: queryElement("#appearance_filter", HTMLSelectElement),
    codeGrid: queryElement("#code_grid", HTMLElement),
    colorEnabled: queryElement("#color_enabled", HTMLInputElement),
    colorLightness: queryElement("#color_lightness", HTMLInputElement),
    colorPicker: queryElement("#color_picker", HTMLInputElement),
    colorPreview: queryElement("#color_preview", HTMLElement),
    colorRgb: queryElement("#color_rgb", HTMLOutputElement),
    colorWheel: queryElement("#color_wheel", HTMLElement),
    colorWheelButton: queryElement("#color_wheel_button", HTMLButtonElement),
    colorWheelMarker: queryElement("#color_wheel_marker", HTMLElement),
    colorWheelPopover: queryElement("#color_wheel_popover", HTMLElement),
    hueFilter: queryElement("#hue_filter", HTMLSelectElement),
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

function closeColorWheel() {
    elements.colorWheelPopover.hidden = true;
    elements.colorWheelButton.setAttribute("aria-expanded", "false");
}

function commitColorRender() {
    if (colorRenderTimer !== 0) {
        globalThis.clearTimeout(colorRenderTimer);
        colorRenderTimer = 0;
    }

    render();
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
 * @param {ColorRgb} color
 * @param {ColorRgb} target
 *
 * @returns {number}
 */
function getColorDistance(color, target) {
    const redDelta = color.r - target.r;
    const greenDelta = color.g - target.g;
    const blueDelta = color.b - target.b;

    return Math.hypot(redDelta, greenDelta, blueDelta);
}

/**
 * @param {PointerEvent} event
 *
 * @returns {string}
 */
function getColorFromWheelPointer(event) {
    const bounds = elements.colorWheel.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radius = bounds.width / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const hue = (Math.atan2(y, x) * 180) / Math.PI;
    const normalizedHue = (hue + 360) % 360;
    const saturation = Math.min(Math.hypot(x, y) / radius, 1);
    const lightness = Number.parseInt(elements.colorLightness.value, 10) / 100;

    return rgbToHex(
        hslToRgb({
            hue: normalizedHue,
            lightness,
            saturation,
        })
    );
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
        const matchesHue =
            state.hue === "all" || themeMatchesHue(theme, state.hue);
        const matchesColor = themeMatchesPickedColor(theme);

        return matchesAppearance && matchesQuery && matchesHue && matchesColor;
    });
}

/**
 * @param {ColorRgb} color
 *
 * @returns {string}
 */
function getHueCategory(color) {
    const { hue, lightness, saturation } = rgbToHsl(color);

    if (saturation < 0.16 || lightness < 0.08 || lightness > 0.94) {
        return "neutral";
    }

    if (hue < 16 || hue >= 345) {
        return "red";
    }

    if (hue < 45) {
        return "orange";
    }

    if (hue < 71) {
        return "yellow";
    }

    if (hue < 156) {
        return "green";
    }

    if (hue < 196) {
        return "cyan";
    }

    if (hue < 251) {
        return "blue";
    }

    if (hue < 291) {
        return "purple";
    }

    return "pink";
}

/**
 * @param {ColorHsl} color
 *
 * @returns {ColorRgb}
 */
function hslToRgb(color) {
    const chroma = (1 - Math.abs(2 * color.lightness - 1)) * color.saturation;
    const huePrime = color.hue / 60;
    const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));
    const match = color.lightness - chroma / 2;

    /** @type {readonly [number, number, number]} */
    let channels = [
        chroma,
        0,
        secondary,
    ];

    if (huePrime < 1) {
        channels = [
            chroma,
            secondary,
            0,
        ];
    } else if (huePrime < 2) {
        channels = [
            secondary,
            chroma,
            0,
        ];
    } else if (huePrime < 3) {
        channels = [
            0,
            chroma,
            secondary,
        ];
    } else if (huePrime < 4) {
        channels = [
            0,
            secondary,
            chroma,
        ];
    } else if (huePrime < 5) {
        channels = [
            secondary,
            0,
            chroma,
        ];
    }

    return {
        b: Math.round((channels[2] + match) * 255),
        g: Math.round((channels[1] + match) * 255),
        r: Math.round((channels[0] + match) * 255),
    };
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
 * @returns {readonly ColorRgb[]}
 */
function getThemeRgbColors(theme) {
    return getThemeColorValues(theme)
        .map((color) => parseHexColor(color))
        .filter((color) => isColorRgb(color));
}

/**
 * @param {Theme} theme
 *
 * @returns {readonly string[]}
 */
function getThemeColorValues(theme) {
    return [
        ...Object.values(theme.colors),
        ...theme.rules.flatMap((rule) => [rule.background, rule.foreground]),
    ].filter((color) => isNonEmptyString(color));
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
 * @param {null | ColorRgb} value
 *
 * @returns {value is ColorRgb}
 */
function isColorRgb(value) {
    return value !== null;
}

/**
 * @param {unknown} value
 *
 * @returns {value is string}
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

/**
 * @param {string} value
 *
 * @returns {null | ColorRgb}
 */
function parseHexColor(value) {
    const normalized = value.trim().replace(/^#/v, "").toLowerCase();

    if (
        ![
            3,
            6,
            8,
        ].includes(normalized.length) ||
        !/^[\da-f]+$/v.test(normalized)
    ) {
        return null;
    }

    const rgb =
        normalized.length === 3
            ? `${normalized.charAt(0).repeat(2)}${normalized
                  .charAt(1)
                  .repeat(2)}${normalized.charAt(2).repeat(2)}`
            : normalized.slice(0, 6);

    return {
        b: Number.parseInt(rgb.slice(4, 6), 16),
        g: Number.parseInt(rgb.slice(2, 4), 16),
        r: Number.parseInt(rgb.slice(0, 2), 16),
    };
}

function openColorWheel() {
    syncColorControlUi();
    elements.colorWheelPopover.hidden = false;
    elements.colorWheelButton.setAttribute("aria-expanded", "true");
    elements.colorWheel.focus();
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
 * @param {ThemeRule} rule
 * @param {"background" | "fontStyle" | "foreground"} key
 *
 * @returns {string | undefined}
 */
function readRuleStyleValue(rule, key) {
    if (key === "background") {
        return rule.background;
    }

    if (key === "fontStyle") {
        return rule.fontStyle;
    }

    return rule.foreground;
}

/**
 * @param {MatchedStyle} style
 * @param {"background" | "fontStyle" | "foreground"} key
 * @param {string} value
 */
function writeMatchedStyle(style, key, value) {
    if (key === "background") {
        style.background = value;
    } else if (key === "fontStyle") {
        style.fontStyle = value;
    } else {
        style.foreground = value;
    }
}

/**
 * @param {readonly ThemeRule[]} rules
 * @param {string} tokenScope
 *
 * @returns {MatchedStyle}
 */
function matchStyle(rules, tokenScope) {
    /** @type {MatchedStyle} */
    const style: MatchedStyle = {};
    const scores: Record<string, number> = {};

    for (const rule of rules) {
        const selector = rule.scope;

        if (typeof selector !== "string") {
            continue;
        }

        const score = selectorScore(selector, tokenScope);

        if (score <= 0) {
            continue;
        }

        for (const key of styleKeys) {
            const value = readRuleStyleValue(rule, key);

            if (
                typeof value === "string" &&
                value.length > 0 &&
                score >= (scores[key] ?? 0)
            ) {
                writeMatchedStyle(style, key, value);
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
        button.setAttribute(
            "aria-pressed",
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
    const selectedThemeVisible = filteredThemes.some(
        (theme) => theme.id === state.selectedId
    );

    elements.themeCount.textContent =
        filteredThemes.length === state.themes.length
            ? `${state.themes.length} themes`
            : `${filteredThemes.length}/${state.themes.length} themes`;

    if (!selectedThemeVisible) {
        state.selectedId = "";

        if (filteredThemes.length > 0) {
            state.selectedId = filteredThemes[0].id;
        }
    }

    renderThemeList();

    const selectedTheme = state.themes.find(
        (theme) => theme.id === state.selectedId
    );

    if (selectedTheme === undefined) {
        renderEmptyPreview();
        return;
    }

    renderThemePreview(selectedTheme);
}

function renderEmptyPreview() {
    elements.selectedName.textContent = "No matching themes";
    elements.selectedAppearance.textContent = "Theme";
    elements.themeDownload.href = "../themes/";
    elements.metadataStrip.replaceChildren();
    appendElement(elements.metadataStrip, "metadata-pill", "No color match");
    elements.codeGrid.replaceChildren();
}

function scheduleColorRender() {
    if (colorRenderTimer !== 0) {
        globalThis.clearTimeout(colorRenderTimer);
    }

    colorRenderTimer = globalThis.setTimeout(() => {
        colorRenderTimer = 0;
        render();
    }, colorRenderDelayMs);
}

/**
 * @param {ColorRgb} color
 *
 * @returns {string}
 */
function rgbToHex(color) {
    return `#${toHexChannel(color.r)}${toHexChannel(color.g)}${toHexChannel(
        color.b
    )}`;
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

/**
 * @param {ColorRgb} color
 *
 * @returns {ColorHsl}
 */
function rgbToHsl(color) {
    const red = color.r / 255;
    const green = color.g / 255;
    const blue = color.b / 255;
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const lightness = (maximum + minimum) / 2;
    const delta = maximum - minimum;

    if (delta === 0) {
        return {
            hue: 0,
            lightness,
            saturation: 0,
        };
    }

    let saturation = delta / (maximum + minimum);

    if (lightness > 0.5) {
        saturation = delta / (2 - maximum - minimum);
    }

    let hue = ((red - green) / delta + 4) * 60;

    if (maximum === red) {
        hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
    } else if (maximum === green) {
        hue = ((blue - red) / delta + 2) * 60;
    }

    return {
        hue,
        lightness,
        saturation,
    };
}

/**
 * @param {string} hex
 * @param {{ readonly renderMode?: "defer" | "none" | "now" }} [options]
 */
function setSelectedColor(hex, options: ColorRenderOptions = {}) {
    const color = parseHexColor(hex);

    if (color === null) {
        return;
    }

    const normalizedHex = rgbToHex(color);
    state.colorHex = normalizedHex;
    elements.colorPicker.value = normalizedHex;
    syncColorControlUi();

    const renderMode = options.renderMode ?? "now";

    if (renderMode === "defer") {
        scheduleColorRender();
    } else if (renderMode === "now") {
        commitColorRender();
    }
}

function syncColorControlUi() {
    const fallbackColor = /** @type {ColorRgb} */ {
        b: 198,
        g: 214,
        r: 105,
    };
    let color = parseHexColor(state.colorHex);
    color ??= fallbackColor;
    const hsl = rgbToHsl(color);
    const hex = rgbToHex(color);
    const markerRadius = hsl.saturation * 46;
    const markerLeft = 50 + Math.cos((hsl.hue * Math.PI) / 180) * markerRadius;
    const markerTop = 50 + Math.sin((hsl.hue * Math.PI) / 180) * markerRadius;
    const shade = Math.max(0, (0.5 - hsl.lightness) * 1.7);

    elements.colorPreview.style.backgroundColor = hex;
    elements.colorRgb.textContent = `rgb(${color.r}, ${color.g}, ${color.b})`;
    elements.colorWheel.style.setProperty("--selected-color", hex);
    elements.colorWheel.style.setProperty("--marker-left", `${markerLeft}%`);
    elements.colorWheel.style.setProperty("--marker-top", `${markerTop}%`);
    elements.colorWheel.style.setProperty("--wheel-shade", String(shade));
    elements.colorWheelMarker.style.backgroundColor = hex;
    elements.colorLightness.value = String(Math.round(hsl.lightness * 100));
}

/**
 * @param {Theme} theme
 *
 * @returns {boolean}
 */
function themeMatchesPickedColor(theme) {
    if (state.colorEnabled) {
        const target = parseHexColor(state.colorHex);

        if (target === null) {
            return true;
        }

        return getThemeRgbColors(theme).some(
            (color) => getColorDistance(color, target) <= 84
        );
    }

    return true;
}

/**
 * @param {Theme} theme
 * @param {string} hue
 *
 * @returns {boolean}
 */
function themeMatchesHue(theme, hue) {
    return getThemeRgbColors(theme).some(
        (color) => getHueCategory(color) === hue
    );
}

/**
 * @param {number} value
 *
 * @returns {string}
 */
function toHexChannel(value) {
    return Math.min(255, Math.max(0, value)).toString(16).padStart(2, "0");
}

function toggleColorWheel() {
    if (elements.colorWheelPopover.hidden === true) {
        openColorWheel();
        return;
    }

    closeColorWheel();
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

elements.hueFilter.addEventListener("change", (event) => {
    const target = event.target;
    state.hue = target instanceof HTMLSelectElement ? target.value : "all";
    render();
});

elements.colorPicker.addEventListener("input", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
        state.colorHex = target.value;

        if (parseHexColor(target.value) !== null) {
            syncColorControlUi();
            scheduleColorRender();
        }
    }
});

elements.colorEnabled.addEventListener("change", (event) => {
    const target = event.target;
    state.colorEnabled =
        target instanceof HTMLInputElement ? target.checked : false;
    render();
});

elements.colorLightness.addEventListener("input", () => {
    const color = parseHexColor(state.colorHex);

    if (color === null) {
        return;
    }

    const hsl = rgbToHsl(color);
    const lightness = Number.parseInt(elements.colorLightness.value, 10) / 100;
    setSelectedColor(
        rgbToHex(
            hslToRgb({
                ...hsl,
                lightness,
            })
        ),
        { renderMode: "defer" }
    );
});

elements.colorWheel.addEventListener("keydown", (event) => {
    const color = parseHexColor(state.colorHex);

    if (color === null) {
        return;
    }

    const hsl = rgbToHsl(color);

    switch (event.key) {
        case "ArrowDown": {
            event.preventDefault();
            setSelectedColor(
                rgbToHex(
                    hslToRgb({
                        ...hsl,
                        saturation: Math.max(0, hsl.saturation - 0.05),
                    })
                )
            );
            break;
        }

        case "ArrowLeft": {
            event.preventDefault();
            setSelectedColor(
                rgbToHex(
                    hslToRgb({
                        ...hsl,
                        hue: (hsl.hue + 354) % 360,
                    })
                )
            );
            break;
        }

        case "ArrowRight": {
            event.preventDefault();
            setSelectedColor(
                rgbToHex(
                    hslToRgb({
                        ...hsl,
                        hue: (hsl.hue + 6) % 360,
                    })
                )
            );
            break;
        }

        case "ArrowUp": {
            event.preventDefault();
            setSelectedColor(
                rgbToHex(
                    hslToRgb({
                        ...hsl,
                        saturation: Math.min(1, hsl.saturation + 0.05),
                    })
                )
            );
            break;
        }

        default: {
            break;
        }
    }
});

elements.colorWheel.addEventListener("pointerdown", (event) => {
    elements.colorWheel.setPointerCapture(event.pointerId);
    setSelectedColor(getColorFromWheelPointer(event), { renderMode: "none" });
});

elements.colorWheel.addEventListener("pointermove", (event) => {
    if (event.buttons > 0) {
        setSelectedColor(getColorFromWheelPointer(event), {
            renderMode: "none",
        });
    }
});

elements.colorWheel.addEventListener("pointerup", () => {
    commitColorRender();
});

elements.colorWheel.addEventListener("pointercancel", () => {
    commitColorRender();
});

elements.colorWheelButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleColorWheel();
});

document.addEventListener("click", (event) => {
    const target = event.target;

    if (
        target instanceof Node &&
        (elements.colorWheelPopover.contains(target) ||
            elements.colorWheelButton.contains(target))
    ) {
        return;
    }

    closeColorWheel();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeColorWheel();
    }
});

syncColorControlUi();

const response = await fetch("site-data.json");
const data = /** @type {unknown} */ await response.json();
state.themes = readThemes(data);

const allScopes = new Set(
    state.themes.flatMap((theme) => theme.rules.map((rule) => rule.scope))
);

elements.themeCount.textContent = `${state.themes.length} themes`;
elements.scopeCount.textContent = `${allScopes.size} styled scopes`;
render();
