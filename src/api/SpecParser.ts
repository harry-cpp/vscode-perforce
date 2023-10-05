import {
    removeLeadingNewline,
    splitIntoLines,
    removeIndent,
    splitIntoSections,
} from "./CommandUtils";
import { RawField } from "./CommonTypes";

const parseRawField = (value: string) => removeIndent(splitIntoLines(removeLeadingNewline(value)));

function parseRawFields(parts: string[]): RawField[] {
    return parts.map((field) => {
        const colPos = field.indexOf(":");
        const name = field.slice(0, colPos);
        const value = parseRawField(field.slice(colPos + 2));
        return { name, value };
    });
}

export const getBasicField = (fields: RawField[], field: string) =>
    fields.find((i) => i.name === field)?.value;

const excludeNonFields = (parts: string[]) =>
    parts.filter((part) => !part.startsWith("#") && part !== "");

export const parseSpecOutput = (value: string) => parseRawFields(excludeNonFields(splitIntoSections(value)));
