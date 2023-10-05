import * as vscode from "vscode";

export function toReadableDateTime(date?: Date) {
    if (!date) {
        return "???";
    }
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    };
    return date.toLocaleString(vscode.env.language, dateOptions);
}

export function toReadableDate(date?: Date) {
    if (!date) {
        return "???";
    }
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    return date.toLocaleString(vscode.env.language, dateOptions);
}
