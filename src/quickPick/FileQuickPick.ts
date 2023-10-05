import * as vscode from "vscode";

import * as PerforceUri from "../PerforceUri";
import * as p4 from "../api/PerforceApi";
import * as DiffProvider from "../DiffProvider";
import { Display } from "../Display";
import * as AnnotationProvider from "../annotations/AnnotationProvider";
import { isTruthy } from "../TsUtils";

import * as ChangeQuickPick from "./ChangeQuickPick";

import * as qp from "./QuickPickProvider";
import { showIntegPickForFile } from "./IntegrationQuickPick";
import { toReadableDateTime } from "../DateFormatter";
import * as Path from "path";

const nbsp = "\xa0";

export const fileQuickPickProvider: qp.ActionableQuickPickProvider = {
    provideActions: async (uriOrStr: vscode.Uri | string, cached?: CachedOutput) => {
        const uri = qp.asUri(uriOrStr);
        const changes = await getChangeDetails(uri, cached);
        const actions = makeNextAndPrevPicks(uri, changes).concat(
            makeClipboardPicks(uri, changes),
            makeSyncPicks(uri, changes),
            makeDiffPicks(uri, changes),
            makeChangelistPicks(uri, changes)
        );
        return {
            items: actions,
            placeHolder: makeRevisionSummary(changes.current),
            recentKey: "file:" + PerforceUri.fsPathWithoutRev(uri),
        };
    },
};

export async function showQuickPickForFile(uri: vscode.Uri, cached?: CachedOutput) {
    await qp.showQuickPick("file", uri, cached);
}

export const fileRevisionQuickPickProvider: qp.ActionableQuickPickProvider = {
    provideActions: async (
        uriOrStr: vscode.Uri | string,
        includeIntegrations: boolean,
        includeIntegrationTargets: boolean,
        includeNewerRevisions: boolean,
        cached?: CachedOutput
    ) => {
        const uri = qp.asUri(uriOrStr);
        const changes = await getChangeDetails(uri, cached);
        const actions = makeAllRevisionPicks(
            uri,
            changes,
            includeIntegrations,
            includeIntegrationTargets,
            includeNewerRevisions
        );
        return {
            items: actions,
            excludeFromHistory: true,
            placeHolder:
                "Choose revision for " +
                changes.current.file +
                "#" +
                changes.current.revision,
        };
    },
};

export async function showRevChooserForFile(uri: vscode.Uri, cached?: CachedOutput) {
    await qp.showQuickPick("filerev", uri, false, false, true, cached);
}

async function showRevChooserWithIntegrations(
    uri: vscode.Uri,
    includeIntegrations: boolean,
    includeIntegrationTargets: boolean,
    includeNewerRevisions: boolean,
    cached?: CachedOutput
) {
    await qp.showQuickPick(
        "filerev",
        uri,
        includeIntegrations,
        includeIntegrationTargets,
        includeNewerRevisions,
        cached
    );
}

export const fileDiffQuickPickProvider: qp.ActionableQuickPickProvider = {
    provideActions: async (
        uriOrStr: vscode.Uri | string,
        includeNewerRevisions: boolean
    ) => {
        const uri = qp.asUri(uriOrStr);
        const changes = await getChangeDetails(uri, undefined, true);
        const actions = makeDiffRevisionPicks(uri, changes, includeNewerRevisions);
        return {
            items: actions,
            excludeFromHistory: true,
            placeHolder:
                "Diff revision for " +
                changes.current.file +
                "#" +
                changes.current.revision,
        };
    },
};

export async function showDiffChooserForFile(uri: vscode.Uri) {
    await qp.showQuickPick("filediff", uri, true);
}

async function showDiffChooserWithOptions(
    uri: vscode.Uri,
    includeNewerRevisions: boolean
) {
    await qp.showQuickPick("filediff", uri, includeNewerRevisions);
}

type CachedOutput = {
    filelog?: p4.FileLogItem[];
    haveFile?: p4.HaveFile;
};

type ChangeDetails = {
    all: p4.FileLogItem[];
    current: p4.FileLogItem;
    currentIndex: number;
    next?: p4.FileLogItem;
    prev?: p4.FileLogItem;
    latest: p4.FileLogItem;
    haveFile?: p4.HaveFile;
};

function makeCache(details: ChangeDetails): CachedOutput {
    return {
        filelog: details.all,
        haveFile: details.haveFile,
    };
}

function makeRevisionSummary(change: p4.FileLogItem) {
    return (
        change.file +
        "#" +
        change.revision +
        " " +
        change.operation +
        " on " +
        toReadableDateTime(change.date) +
        " by " +
        change.user +
        " : " +
        change.description
    );
}

function makeShortSummary(change: p4.FileLogItem) {
    return (
        "#" +
        change.revision +
        (change.date ? "  $(calendar) " + change.date.toString() : "") +
        " $(person) " +
        change.user +
        " $(circle-filled) " +
        change.description.slice(0, 32)
    );
}

async function getChangeDetails(
    uri: vscode.Uri,
    cached?: CachedOutput,
    followBranches?: boolean
): Promise<ChangeDetails> {
    const haveFile = cached?.haveFile ?? (await p4.have(uri, { file: uri }));

    const uriRev = PerforceUri.getRevOrAtLabel(uri);
    const useRev = !uriRev || isNaN(parseInt(uriRev)) ? haveFile?.revision : uriRev;
    if (!useRev) {
        Display.showError("Unable to get file details without a revision");
        throw new Error("No revision available for " + uri.toString());
    }

    const arg = PerforceUri.fromUriWithRevision(uri, "");

    const filelog =
        cached?.filelog ??
        (await p4.getFileHistory(uri, { file: arg, followBranches: followBranches }));

    if (filelog.length === 0) {
        Display.showImportantError("No file history found");
        throw new Error("Filelog info empty");
    }

    const currentIndex = filelog.findIndex((c) => c.revision === useRev);
    const current = filelog[currentIndex];
    const next = filelog[currentIndex - 1];
    const prev = filelog[currentIndex + 1];
    const latest = filelog[0];

    return { all: filelog, current, currentIndex, next, prev, latest, haveFile };
}

function makeAllRevisionPicks(
    uri: vscode.Uri,
    changes: ChangeDetails,
    includeIntegrations: boolean,
    includeIntegrationTargets: boolean,
    includeNewerRevisions: boolean
): qp.ActionableQuickPickItem[] {
    const ageFiltered = includeNewerRevisions
        ? changes.all
        : changes.all.slice(
              changes.all.findIndex((c) => c.chnum === changes.current.chnum)
          );
    const revPicks = ageFiltered.flatMap((change) => {
        const icon =
            change === changes.current ? "$(location)" : "$(debug-stackframe-dot)";
        const fromRevs = includeIntegrations
            ? change.integrations.filter((c) => c.direction === p4.Direction.FROM)
            : [];
        const toRevs = includeIntegrationTargets
            ? change.integrations.filter((c) => c.direction === p4.Direction.TO)
            : [];

        const revPick: qp.ActionableQuickPickItem = {
            label: icon + " #" + change.revision,
            description: change.description,
            detail:
                nbsp.repeat(10) +
                change.operation +
                " $(person) " +
                change.user +
                nbsp +
                " $(calendar) " +
                nbsp +
                toReadableDateTime(change.date),
            performAction: () => {
                const revUri = PerforceUri.fromDepotPath(
                    PerforceUri.getUsableWorkspace(uri) ?? uri,
                    change.file,
                    change.revision
                );
                return showQuickPickForFile(revUri, makeCache(changes));
            },
        };

        const fromPicks = fromRevs.map((rev) => {
            return {
                label:
                    nbsp.repeat(10) +
                    "$(git-merge) " +
                    rev.operation +
                    " from " +
                    rev.file +
                    "#" +
                    qp.toRevString(rev.startRev, rev.endRev),
                performAction: () => {
                    const revUri = PerforceUri.fromDepotPath(
                        PerforceUri.getUsableWorkspace(uri) ?? uri,
                        rev.file,
                        rev.endRev
                    );
                    return showQuickPickForFile(revUri);
                },
            };
        });

        const toPicks = toRevs.map((rev) => {
            return {
                label:
                    nbsp.repeat(10) +
                    "$(source-control) " +
                    rev.operation +
                    " into " +
                    rev.file +
                    "#" +
                    rev.endRev,
                performAction: () => {
                    const revUri = PerforceUri.fromDepotPath(
                        PerforceUri.getUsableWorkspace(uri) ?? uri,
                        rev.file,
                        rev.endRev
                    );
                    return showQuickPickForFile(revUri);
                },
            };
        });

        return [revPick, ...toPicks, ...fromPicks].filter(isTruthy);
    });

    const controls: qp.ActionableQuickPickItem[] = [
        {
            label: includeIntegrationTargets
                ? "$(exclude) Hide integration target files"
                : "$(gear) Show integration target files",
            performAction: () => {
                return showRevChooserWithIntegrations(
                    uri,
                    includeIntegrations,
                    !includeIntegrationTargets,
                    includeNewerRevisions,
                    makeCache(changes)
                );
            },
        },
        {
            label: includeIntegrations
                ? "$(exclude) Hide integration source files"
                : "$(gear) Show integration source files",
            performAction: () => {
                return showRevChooserWithIntegrations(
                    uri,
                    !includeIntegrations,
                    includeIntegrationTargets,
                    includeNewerRevisions,
                    makeCache(changes)
                );
            },
        },
        {
            label: includeNewerRevisions
                ? "$(exclude) Hide newer revisions"
                : "$(gear) Show newer revisions",
            performAction: () => {
                return showRevChooserWithIntegrations(
                    uri,
                    includeIntegrations,
                    includeIntegrationTargets,
                    !includeNewerRevisions,
                    makeCache(changes)
                );
            },
        },
    ];

    return controls.concat(revPicks);
}

function makeDiffRevisionPicks(
    uri: vscode.Uri,
    changes: ChangeDetails,
    includeNewerRevisions: boolean
): qp.ActionableQuickPickItem[] {
    const currentUri = PerforceUri.fromDepotPath(
        PerforceUri.getUsableWorkspace(uri) ?? uri,
        changes.current.file,
        changes.current.revision
    );
    const controls: qp.ActionableQuickPickItem[] = [
        {
            label: includeNewerRevisions
                ? "$(exclude) Hide newer revisions"
                : "$(gear) Show newer revisions",
            performAction: () => {
                return showDiffChooserWithOptions(uri, !includeNewerRevisions);
            },
        },
    ];

    const ageFiltered = includeNewerRevisions
        ? changes.all
        : changes.all.slice(
              changes.all.findIndex((change) => change.chnum === changes.current.chnum)
          );
    const revPicks = ageFiltered.map((change, i) => {
        const prefix =
            change === changes.current
                ? "$(location) "
                : change.file === changes.current.file
                ? "$(debug-stackframe-dot) "
                : "$(git-merge) " + change.file;
        const isOldRev = i > changes.currentIndex;
        return {
            label: prefix + "#" + change.revision,
            description:
                change.operation +
                " $(person) " +
                change.user +
                nbsp +
                " $(book) " +
                nbsp +
                change.description,
            performAction: () => {
                const thisUri = PerforceUri.fromDepotPath(
                    PerforceUri.getUsableWorkspace(uri) ?? uri,
                    change.file,
                    change.revision
                );
                DiffProvider.diffFiles(
                    isOldRev ? thisUri : currentUri,
                    isOldRev ? currentUri : thisUri
                );
            },
        };
    });
    return controls.concat(revPicks);
}

function makeNextAndPrevPicks(
    uri: vscode.Uri,
    changes: ChangeDetails
): qp.ActionableQuickPickItem[] {
    const prev = changes.prev;
    const next = changes.next;
    const integFrom = changes.current.integrations.find(
        (i) => i.direction === p4.Direction.FROM
    );
    return [
        prev
            ? {
                  label: "$(arrow-small-left) Previous revision",
                  description: makeShortSummary(prev),
                  performAction: () => {
                      const prevUri = PerforceUri.fromDepotPath(
                          PerforceUri.getUsableWorkspace(uri) ?? uri,
                          prev.file,
                          prev.revision
                      );
                      return showQuickPickForFile(prevUri, makeCache(changes));
                  },
              }
            : {
                  label: "$(arrow-small-left) Previous revision",
                  description: "n/a",
              },
        next
            ? {
                  label: "$(arrow-small-right) Next revision",
                  description: makeShortSummary(next),
                  performAction: () => {
                      const nextUri = PerforceUri.fromDepotPath(
                          PerforceUri.getUsableWorkspace(uri) ?? uri,
                          next.file,
                          next.revision
                      );
                      return showQuickPickForFile(nextUri, makeCache(changes));
                  },
              }
            : {
                  label: "$(arrow-small-right) Next revision",
                  description: "n/a",
              },
        {
            label: "$(symbol-numeric) File history...",
            description: "Go to a specific revision",
            performAction: () => {
                showRevChooserForFile(uri, makeCache(changes));
            },
        },
        integFrom
            ? {
                  label: "$(git-merge) Go to integration source revision",
                  description:
                      integFrom.operation +
                      " from " +
                      integFrom.file +
                      "#" +
                      integFrom.endRev,
                  performAction: () => {
                      const integUri = PerforceUri.fromDepotPath(
                          PerforceUri.getUsableWorkspace(uri) ?? uri,
                          integFrom.file,
                          integFrom.endRev
                      );
                      return showQuickPickForFile(integUri);
                  },
              }
            : undefined,
        {
            label: "$(source-control) Go to integration target...",
            description: "See integrations that include this revision",
            performAction: () => showIntegPickForFile(uri),
        },
    ].filter(isTruthy);
}

function makeClipboardPicks(
    _uri: vscode.Uri,
    changes: ChangeDetails
): qp.ActionableQuickPickItem[] {
    return [
        qp.makeClipPick(
            "depot path",
            changes.current.file + "#" + changes.current.revision
        ),
    ];
}

function makeSyncPicks(
    uri: vscode.Uri,
    change: ChangeDetails
): qp.ActionableQuickPickItem[] {
    return [
        {
            label: "$(repo-pull) Sync this revision",
            description:
                "Sync " +
                Path.basename(change.current.file) +
                "#" +
                change.current.revision,
            performAction: async () => {
                await p4.sync(uri, {
                    files: [change.current.file + "#" + change.current.revision],
                });
                Display.showMessage("File synced");
            },
        },
    ];
}

function makeDiffPicks(
    uri: vscode.Uri,
    changes: ChangeDetails
): qp.ActionableQuickPickItem[] {
    const prev = changes.prev;
    const latest = changes.latest;
    const have = changes.haveFile;
    return [
        {
            label: "$(file) Show this revision",
            description: "Open this revision in the editor",
            performAction: () => {
                vscode.window.showTextDocument(uri);
            },
        },
        have
            ? {
                  label: "$(file) Open workspace file",
                  description: "Open the local file in the editor",
                  performAction: () => {
                      vscode.window.showTextDocument(have.localUri);
                  },
              }
            : undefined,
        {
            label: "$(list-ordered) Annotate this revision",
            description: "Open in the editor, with change details for each line",
            performAction: () => {
                AnnotationProvider.annotate(uri);
            },
        },
        prev
            ? {
                  label: "$(diff) Diff against previous revision",
                  description: DiffProvider.diffTitleForDepotPaths(
                      prev.file,
                      prev.revision,
                      changes.current.file,
                      changes.current.revision
                  ),
                  performAction: () => DiffProvider.diffPreviousIgnoringLeftInfo(uri),
              }
            : undefined,
        latest !== changes.current
            ? {
                  label: "$(diff) Diff against latest revision",
                  description: DiffProvider.diffTitleForDepotPaths(
                      changes.current.file,
                      changes.current.revision,
                      latest.file,
                      latest.revision
                  ),
                  performAction: () =>
                      DiffProvider.diffFiles(
                          PerforceUri.fromDepotPath(
                              PerforceUri.getUsableWorkspace(uri) ?? uri,
                              changes.current.file,
                              changes.current.revision
                          ),
                          PerforceUri.fromDepotPath(
                              PerforceUri.getUsableWorkspace(uri) ?? uri,
                              latest.file,
                              latest.revision
                          )
                      ),
              }
            : undefined,
        {
            label: "$(diff) Diff against workspace file",
            description: have ? "" : "No matching workspace file found",
            performAction: have
                ? () => {
                      DiffProvider.diffFiles(
                          PerforceUri.fromDepotPath(
                              PerforceUri.getUsableWorkspace(uri) ?? uri,
                              changes.current.file,
                              changes.current.revision
                          ),
                          have.localUri
                      );
                  }
                : undefined,
        },
        {
            label: "$(diff) Diff against...",
            description: "Choose another revision to diff against",
            performAction: () => {
                showDiffChooserForFile(uri);
            },
        },
    ].filter(isTruthy);
}

function makeChangelistPicks(
    uri: vscode.Uri,
    changes: ChangeDetails
): qp.ActionableQuickPickItem[] {
    return [
        {
            label: "$(list-flat) Go to changelist details",
            description:
                "Change " +
                changes.current.chnum +
                nbsp +
                " $(book) " +
                nbsp +
                changes.current.description,
            performAction: () =>
                ChangeQuickPick.showQuickPickForChangelist(uri, changes.current.chnum),
        },
    ];
}
