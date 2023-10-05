# Change log

## [4.15.6] - 2023-03-02

* Work around vscode/#17588 where extension would not properly initialize
  
## [4.15.5] - 2022-08-14

* Add setting `perforce.debugP4Commands` that logs all commands and their output to the javascript debug console (use 'Toggle developer tools' command to view)

## [4.15.4] - 2022-08-01

* Fix an issue where the 'opened' command from the status bar menu failed to open the selected file

## [4.15.3] - 2022-07-24

* Fix an issue where opening search results in the editor could stop the extension from working (#234)

## [4.15.2] - 2021-05-09

* Fix the inability to attach perforce jobs that contain non-alphanumeric characters (#208)
* Fix the "show job" command not working from the job quick pick, due to incorrect detection of the working directory

## [4.15.1] - 2021-02-23

* Fix an issue where the count shown on the scm badge was incorrect after submitting a changelist (#205)

## [4.15.0] - 2021-02-14

* Add file explorer decorations for open files (#201)
* Ths minimum VS Code version is now 1.53

## [4.14.0] - 2020-10-08

* Tidy up the context commands for individual files in the SCM view
  * From VS Code 1.50 it's possible to provide different context commands per file. For example, we now have a separate shelve vs unshelve icon, and a "delete shelved file" icon instead of the previously unusable revert icon on a shelved file. The right click context has also been tidied up
* Move explorer context commands to a sub-menu
  * From VS Code 1.50 it's possible to provide sub-menus - Previously the "Perforce:" menu items took up a lot of space on the explorer context menu - Now they're all on a sub-menu instead

## [4.13.0] - 2020-09-13

* Improve the refresh behaviour, so that it does not clear out and replace the list of changelists every time (#170)
  * This means that when you collapse a changelist, it doesn't expand again when you next do anything, like open a file for edit. It also prevents the 'flickeriness' where all the changelists disappear and reappear on refresh
  * The only exception is, when a new changelist is added, we still have to refresh the whole view, to maintain the correct order of changelists
  * As this is quite a significant change, please look out for any bugs relating to changelists having the wrong state, and raise an issue if things look wrong. There is also a new "Refresh (clean)" command to force a full refresh in case of any bugs
* Add a command to the changelist context menu to copy the changelist number (#183)
* Fixed an issue where the SCM view was not refreshed when an individual file was resolved
* The minimum VS Code version is now 1.49

## [4.12.0] - 2020-08-09

* Add an option `perforce.syncMode`. This controls the set of files to sync when using the "sync" command on the SCM provider. You can either sync the whole perforce client area, or just the part that is contained in the VS code workspace (#169)
  * The default is the existing behaviour: sync the whole perforce client area.
  * There are some caveats to syncing the just the vs code workspace, depending on your setup:
    * If you just opened a file from a different VS code workspace and it auto detected the perforce client for that area, it will sync the whole of the perforce client area, since we can only know about the workspace you have open
    * If you forced a perforce client to activate using `perforce.activationMode`, and the perforce client location does not relate to the current workspace, you will most likely end up syncing nothing
* Add a command to "close" a perforce client when there are multiple SCM providers in the workspace - right click on the header for the perforce client you want to close (#174)
* Shorten the name of the configuration section to "Perforce" (this does not affect the names of the settings themselves, just the category in the settings view) - Thanks @NSExceptional

## [4.11.0] - 2020-06-25

* Add an icon to the changelist search view that will be visible if the view is dragged to its own container in the sidebar
* Support perforce case insensitive perforce servers, where the local folder has different case to the server folder
* The minimum vs code version is now 1.46

## [4.10.0] - 2020-06-04

* Persist search filters between sessions for a given workspace
* Fix an issue where commands used to display perforce output in the editor didn't work (e.g. describe changelist, show job spec)

## [4.9.0] - 2020-05-31

* Add buttons to the changelist search results, to open the depot version of the file, or its diff directly, without needing to use the quick pick menu
* Add rudimentary support for using the `${workspaceFolder}` variable in the `perforce.command` setting (#153)
  * This is experimental, in as much as:
    * The behaviour may not always be intuitive in multi-root workspaces / files opened without workspaces
      * It attempts to use the workspace folder for the file being operated on
      * If this fails, it uses the 'first' open workspace
      * If this fails, it is replaced with a blank string
    * If official support for these expansions is ever added to VS code, this may not be backward compatible
* Choosing to diff from the scm view when multiple items are selected now opens all of the selected diffs instead of just one (#155)
* Fix error when opening the diff for a file opened for add (#156)

## [4.8.2] - 2020-05-20

* Re-add revision numbers / labels, using a new, more correct approach (#150)

## [4.8.1] - 2020-05-18

* Revert the change to add revision nubmers / labels as it prevented syntax highlighting from working (#150)
* Select the description when creating a new changelist / job

## [4.8.0] - 2020-05-17

* Add the ability to create a new changelist or job using the spec editor - accessible from the SCM context menu and the command palette
* When opening a specific revision in the editor, (and not in a diff), the revision number is now included in the editor title
  * This is a more complex / wide-reaching change than you might expect, so if you see revisions or labels popping up in unexpected places please raise an issue
* Add a new mode for `perforce.hideNonWorkspaceFiles` that hides pending changelists that ONLY contain non-workspace files, but also hides non-workspace files in the default changelist
* Fixed a few dodgy setting names / descriptions

## [4.7.0] - 2020-05-11

* Add the ability to edit the full change spec for a changelist in the editor - accessible from the SCM context menu and the changelist quick pick
* Add the ability to edit the job spec for a job, accessible from the job quick pick
* Fix status bar errors showing when there were no results for a search, or no results with shelved files

## [4.6.0] - 2020-05-08

A few quality of life improvements to quick picks and searching

* In the world of quick picks:
  * Add a 'job' quick pick - click on a job from the changelist quick pick to see job details and other changelists fixing the same job
  * Clicking on a shelved file from the changelist quick pick now shows options for the shelved file such as viewing and diffing the shelved file
  * When unshelving a changelist through a branch mapping (via the change quick pick), entering `*` in the branch name will act as a wildcard and search for matching branches
  * The changelist quick pick now includes the changelist status (pending / submitted) in its title
  * Add 'go to job' and 'go to changelist' commands, accessible from the SCM provider's context menu and the command palette
  * Add 'open last quick pick' / 'open recent quick pick' to the SCM provider's context menu and the command palette
* In the changelist search:
  * Changelist search results now show shelved files, if there are any
  * When entering user and client filters, entering `*` will act as a wildcard and search for matching users / clients
  * When entering user, client and path filters, you no longer need to click on the 'Enter a {thing}' option before entering the text, you can just start typing straight away
* When logging in from the command palette, and you have multiple perforce clients in your workspace, it will now prompt to ask you which one to log in with
* Add a variety of new keyboard shortcuts for common actions (in addition to the existing shortcuts):

| shortcut           | action                | Description |
|--------------------|-----------------------|-------------|
| `alt+p alt+d`      | perforce.diffRevision | Choose a revision of the open file to diff against |
| `alt+p h`          | perforce.showOpenFileHistory | Show file history for the open file |
| `alt+p m`          | perforce.move | Move or rename the current file |
| `alt+p p`          | perforce.showLastQuickPick | Show the last opened quick pick |
| `alt+p alt+p`      | perforce.showRecentQuickPick | Choose a recently opened quick pick to reopen |
| `alt+p down`       | perforce.syncOpenFile | Sync the open file |
| `alt+p alt+down`   | perforce.syncOpenFileRevision | Choose a specific revision of the open file to sync |
| `alt+p shift+down` | perforce.Sync | Sync everything (just run p4 sync) |
| `alt+p left`       | perforce.diffPrevious | Diff the open file against the previous revision |
| `alt+p right`      | perforce.diffNext | Go to the next revision for the open diff |
| `alt+p up`         | perforce.submitSingle | Submit the current file (provided it is open in the default changelist) |

## [4.5.0] - 2020-05-03

* Add new commands to the explorer context menu. If you don't like them, each section can be disabled using the settings that start with `perforce.explorer.`...
  * Sync (#128)
  * Add / Edit / Revert
  * Move / rename (#13)
  * Delete
* Add 'sync' and 'sync revision' to the status bar menu
* Add 'sync this revision' to the quick pick when looking at file history
* Add confirmation dialog when reverting a file from the status bar menu
* Add 'file history' to the status bar menu


## [4.4.2] - 2020-04-29

* Fix the issue with diffs and the cpp extension again, for cases where the diff is started from the SCM provider (#119)
* Fix issue annotating a file, where the file has a revision integrated from multiple source revisions (#120)

## [4.4.1] - 2020-04-28

* Fix problems relating to diffs:
  * When using remote SSH and diffing the working file against a depot revision, the "diff previous" command now works correctly instead of doing the same diff again (#118)
  * When using the cpp extension locally, it could previously complain about missing files when performing a diff (#119) 
* Fix issue where, after focusing a changelist in the changelist search, clicking the individual files did not work

## [4.4.0] - 2020-04-27

* Add `fileShelveMode` setting to control behaviour when shelving or unshelving an individual file. Choose whether to revert the open file when it is shelved, and delete the shelved file when it is unshelved. (#91)
  * The default is to prompt, but you can also choose to always revert / delete or never revert / delete
* Fix a missing tooltip for the 'add' icon in SCM view
* After a changelist is unshelved using the quick pick, refresh the SCM view before prompting about unresolved files

## [4.3.0] - 2020-04-25

* Add "unshelve into" and "unshelve via branch" to the changelist quick pick, e.g. when searching for changelists (#103)
* Icons on the SCM provider now show a red outline if the file needs resolving (#114)
  * Note - [icons do not show in Remote-SSH](https://github.com/microsoft/vscode-remote-release/issues/2829)
* Add "Resolve changelist" and "Re-resolve changelist" to the SCM provider context menu (#114)
  * This is a fairly rudimentary resolve that just opens up the standard `p4 resolve` command line in a terminal view
  * A new setting is added to change the P4EDITOR when resolving - by default it leaves the P4EDITOR alone. It can be set to `code --wait` to use vscode to edit the merge file, but this value does not seem to work on windows, and is unlikely to be useful with remote-SSH
* Show a warning when an unshelved file needs resolving
* Add a warning when both slevesque.perforce and mjcrouch.perforce are enabled
* When annotating, and hovering over a line, "annotate" is now "annotate previous" (#107)
* Fix an issue where, when the same perforce client was found via two different hostnames, an invisible duplicate SCM provider would be created

## [4.2.0] - 2020-04-21

* Add a changelist search to the SCM provider panel. This allows you to find changelists using a similar set of filters to p4 / P4V - [Feedback welcome](https://github.com/mjcrouch/vscode-perforce/issues/104) (#68)
* More of the changelist description is visible in the SCM provider view
* Now maintains the current position in the file when opening annotations (#106)
* Fix an issue where opening the annotations for a different revision of the current file could apply the annotations to the wrong revision

## [4.1.0] - 2020-04-14

* The extension now checks for perforce clients when you open files outside of the workspace. If a new perforce client is found, it will create an SCM provider so you can manage changelists in that client. This is on by default but can be disabled using the setting `perforce.scm.activateOnFileOpen`
* Add an option to hide *changelists* that only contain non-workspace files - instead of hiding all files outside of the workspace (#90)
* Add support for changelist-based review tools other than swarm - specify a full URL including "${chnum}" in the `perforce.swarmHost` setting (#88)
* Add "open in review tool" context menu item to changelists when the swarm host is specified (#94)
* Add progress indicators when annotating or using the quick pick, for files with lots of lines or lots of revisions where it can take a little longer
* Fix an issue where various commands would not work if the depot name contained any upper case characters (#97)
* Fix shelved files not being hidden when "hide non-workspace files" was selected (#98)

## [4.0.0] - 2020-04-10

**Possible breaking changes in this release!** - this is the main reason for the major version update to v4. The possible breaking changes are mainly around the use of P4CONFIG files.

To mitigate this, the perforce output log has been improved with much more detail, the readme has been rewritten with a new setup section, and a migration guide has been created with details about the changes, in case there are any issues. If you are still having problems, please [search for or raise an issue](https://github.com/mjcrouch/vscode-perforce/issues)

### Activation Changes (#41)

Initialisation of the SCM provider view has been mostly rewritten! Now, we rely more on perforce itself to tell us about your perforce client workspace, instead of building unnecessary logic into the extension. This change was really important - it resolves some common problems with finding your perforce client, and provides a better base for future improvements.

However, this comes with a couple of small trade-offs:

* **Breaking Change**: If your `P4CONFIG` variable is unset, but you previously used a `.p4config` file for your workspace, this SCM provider will no longer be created. The extension should warn you on startup if this is the case. If this occurs, it is easy to resolve by setting your perforce `P4CONFIG` variable to `.p4config` and restarting VS Code
* **Removes support** for an undocumented feature, where `P4DIR` could be added to a p4config file as an instruction to the extension

Otherwise, this version *should* be backward compatible. The following changes have been made in the area of activation:

* Support multiple P4CONFIG files in a single workspace, allowing you to work across multiple perforce client workspaces from a single VS Code folder
* Properly support variable expansions such as `$home` in P4CONFIG files, e.g. as seen in the default 'personal' server setup
* Support opening a workspace where the detected perforce client root is in a directory *underneath* the top-level of the open folder (previously, it would only work if the VS Code workspace was underneath the perforce client root)
* Add detailed perforce output logging, hopefully helping you to understand 'why' when we didn't create an SCM provider
* Add 'welcome message' in the SCM provider view when a perforce client has not been detected
* Perforce commands such as 'edit' and 'revert' are now *always* registered, even with `activationMode` set to `autodetect` - meaning that it's now possible to run these commands on open files without a folder being open (using the command palette)
* No longer create an unusable SCM provider when `activationMode` is `always` and no perforce client was found at-all
* Fix duplicate SCM providers when the same perforce client was found multiple times in a VS Code multi-root workspace

### Other Changes

* Add diff next / previous arrows in the editor title bar (#67). This allows you to click through revisions. Behaviour for these icons can be changed with the setting `perforce.editorButtons.diffPrevAndNext`
* Add file and changelist quick pick (#66) to see and navigate through more information about:
  * the depot revision you are viewing
  * the details of the changelist, and the other files in the changelist
  * integrations to and from the revision
  * other revisions of the file
  * ... and more!
* You must be viewing a depot file to open the quick pick (e.g. if you diff a local file against the depot file, you must click on the left hand side of the diff, and then click the 'commit' icon on the editor title menu)
* You can also reach the new quick pick in annotation mode, from the hover message for a change
  * More ways are coming soon, after VS Code's timeline view is finalised!
* We now use VS Code's built in 'codicons' for almost all icons. This provides a more consistent style with the editor. (further context menu improvements will be coming when context menu support is improved in a later VS code release)
* Automatically refresh the SCM provider view when the user logs on - saves a click!
* Fix an issue where, when there were multiple SCM providers with different users or servers, the "login" command logged you in to the server for the editor file you had open, not the server you chose
* The minimum VS Code version is now 1.44.0

## [3.10.0] - 2020-03-17
* Add 'Edit and Save' command. This may be useful if you are working with a slow or distant perforce server, as it will not try to save the file until the perforce command has completed. (#72)
* Fix an issue where context variables (for use in 'when' clauses) were not set correctly

## [3.9.1] - 2020-03-16
* Resolves an issue where, if the default change spec contains an empty field, it could prevent new changelists from being saved, and prevent 'submit selected files' from working (#74)

## [3.9.0] - 2020-03-16
* Add vscode context variables and commands, to get info about the currently open file, such as the changelist number. This could be useful for custom tasks, keyboard shortcuts etc.
* Add command inputs to the perforce log where appropriate (#74)
* Fix a minor issue where a file not in the client root would show as "not opened for edit" in the status bar

## [3.8.0] - 2020-03-13
* Replaced the annotation view with a new, more advanced view showing a lot more detail about each change (#33)
  * Use the same command as before - "Perforce: Annotate" - to open a new tab showing the annotations for the current file
  * It is possible to customise the gutter to change the level of detail using the experimental `perforce.annotate.gutterColumns` setting
  * By default, the annotation view follows branch actions. This can be disabled with `perforce.annotate.followBranches`
  * There is much more still to do - all feedback welcome!
* Add an inline context item to open a file from the scm provider view (#63 - thanks @allender)

## [3.7.0] - 2020-03-09
* Add an option to hide the submit button from changelists, to prevent accidental submits (thanks @joshuaferrara)
* Add an option to prompt for confirmation before submitting a saved changelist, for the same reason. This option is enabled by default
* Fix problems with files being incorrectly added or deleted during an external operation like p4 sync, when `deleteOnFileDelete` or `addOnFileCreate` were enabled (#52 - thanks @allender)
  * Previously, the extension was watching for filesystem changes to perform these automatic actions. This meant external sync commands, and also things like changes to `node_modules` would be picked up by the extension. It now only attempts to perform the add or delete action when files are added or deleted from *within* the IDE, and not via an external tool.
  * Previously, the extension would incorrectly use `.p4ignore` files to decide whether to delete a file or not. This was not actually correct behaviour, as deletions are not subject to p4ignore rules. We now leave it up to perforce to decide what to ignore (see #5)
* The minimum VS Code version is now 1.42.0

## [3.6.2] - 2020-03-02
* Fix an issue where shelved files that are not mapped in the client view would prevent the scm view from loading (#50)

## [3.6.1] - 2020-02-29
* Fix an issue where perforce client roots may not be correctly detected on windows, because of line ending differences

## [3.6.0] - 2020-02-29
* Add context item to submit selected files from the default changelist (#20)
* Add command palette and status bar menu option to submit the currently  open file (only if it is currently open in the default changelist) (#20)
* Fix issues with escaping of perforce commands:
  * Previously shell characters in changelist descriptions and other places could be interpreted by the shell, leading to unexpected results
  * "Personal" perforce servers did not work because of incorrect escaping. These now work as long as the P4PORT (E.g. in the default .p4config file) does **not** include unexpanded variables, like `$configdir`
* The `perforce.maxBuffer` setting has been removed, because the internal method of running perforce commands has changed, and no longer uses this buffer
* Internally, there has been a large amount of code refactoring to make it easier to implement and test upcoming features. As usual, please [raise an issue](https://github.com/mjcrouch/vscode-perforce/issues) on GitHub if there are any problems!
* The minimum VS Code version is now 1.40.0

## [3.5.2] - 2020-02-13
* Fix "p4" status icon appearing on all workspaces, even without a perforce client
* Fix gutter decorations not being applied after a file was added to the depot (#42)
* Prevent `edit on file save` and `edit on file modified` from continually trying to open the same file when auto save was enabled (#39)
* Fix the extension saying "file opened for edit" even if it wasn't

## [3.5.1] - 2020-02-10
* Gutter decorations for a moved file now show the diff against the file it was moved from, if known (#29)
* Correct the revision used for the scm provider diff if a file is moved (#29)
* The perforce output is always initialised (unless the activiation move is 'off') - which will help to diagnose issues with workspace configuration (#7)
* Hide commands in the command palette when they can't be used (#24)

## [3.5.0] - 2020-02-07
* When using `Move to changelist` from the context menu, it's now possible to create a new changelist. This is useful when you want to move just a few files from the default changelist to a new changelist, instead of all of them (#4)
* Add context menu options to `Attach job` and `Remove job` from a changelist (#3)
* Add context menu item to delete an individual shelved file (#17)
* Prevent `revert file` from being used on shelved files (#17) (ideally the option wouldn't be present at-all, but this is not possible with the current vscode API)
* Gutter decorations to show the diff have been corrected to diff against the have revision (#6)
* Diffing from the scm provider view now diffs against the working / have revision (#6)
* Compatibility with source depot has been removed (I don't think it's possible that anyone is using it) (#8)

## [3.4.0] - 2020-01-29

* Improve performance when refreshing the view (#12)
  * Previously, the 'bottleneck' package used was introducing approximately half a second latency for each perforce command
  * Bottleneck has been removed, and replaced with a custom implementation. As a result, most of the 'perforce.bottleneck' settings have been **removed** - only `perforce.bottleneck.maxConcurrent` remains. This controls how many perforce commands are allowed to run concurrently
* Reduced the amount of command thrashing when performing a large number of operations at the same time (#12)
  * For example, previously when editing 10 files at the same time (for example, because of a find and replace operation with 'Edit on file save' enabled), the scm view would be refreshed 10 times, and each refresh would use a minimum of 5 commands plus a minimum of 1 command per additional changelist
  * Now, any actions that occur within one second of the previous action are collapsed in to one refresh call, and the number of perforce commands per refresh has been reduced
  * There are still issues with doing a large find and replace for files that are not already open, when 'Edit on file save' is enabled - often the first run will fail to save the files, but if you revert everything and do the replace again, it may succeed. This may be a vscode issue. (Clicking 'overwrite' for each file seems to work)
* If you do experience any issues with perforce commands overloading the perforce server, please raise an issue and include the "Perforce Log" output
* Updated the extension icon. "Perfork!"

## [3.3.2] - 2020-01-23

* Resolve another cause for the previous diff issue, where two perforce commands executing at the same time would be given the same ID, and only one of them would run

## [3.3.1] - 2020-01-22

* Resolve issue opening diffs for shelved edits

## [3.3.0] - 2020-01-22

### **Note** This is the first release following the fork to mjcrouch.perforce. All issue references below this point refer to issues in stef-levesque.vscode-perforce

* Ability to shelve and unshelve whole changelists, and delete all shelved files for a changelist
* Ability to diff shelved files against either the depot or the workspace file
* Ability to diff files open for branch / integrate / move
* Updated diff behaviour for files open for add, to show that they originated from an empty file
* The extension is now packaged with webpack which should potentially improve loading times

## [3.2.0] - 2019-04-17

* Add command `delete` (#106, thanks @howardcvalve)
* Ignore changelist with prefix (#131, thanks @forgottenski)
* Hide non workspace files (#134, thanks @tw1nk)
* Option to hide shelved files and empty changelists
* Throttle all perforce commands via bottleneck (#137, #147, thanks @pjdanfor)

## [3.1.0] - 2017-12-17

* Add `Revert Unchanged` for file and changelist (#77)
* Support scm commands when multiple files are selected (#92)
* Better handling of changelist descriptions
* Fix some issues with `editOnFileSave` and `editOnFileModified` (#61, #110)
* Fix duplicate changelists (#62, #67, #79, #82, #115)
* Increase the default value of `perforce.maxBuffer` to 1MB (#116)
* Add a [Common Questions](https://github.com/stef-levesque/vscode-perforce#common-questions) section in the README.md

## [3.0.0] - 2017-11-09

* Multi-root support (#103)

## [2.2.2] - 2017-10-16

* Fix issues with config and detection (#98, #99, thanks @vrachels)

## [2.2.1] - 2017-09-19

* New setting to controls when to activate the extension

## [2.2.0] - 2017-09-17

* New setting to display badge or not (`perforce.countBadge`)
* More global options in settings (`client`, `user`, `port`, `password`, `dir`) (#76, #95)
* Optional `user` for annotation (#75)
* Confirmation on submit (#73)
* New setting to open file change when selected in Explorer (`perforce.scmFileChanges`) (#70)
* Submit Default Changelist (#72, #87, thanks @vrachels)
* Multi-repo SCM support (#74, #83, #84, #88, thanks @vrachels)
* Show fstat output when selecting a binary file (#89, thanks @vrachels)

## [2.1.1] - 2017-06-28

* Set a maximum number of line per command ()
* Send more detailed errors to the `Perforce Logs`
* Change deprecated `withScmProgress`

## [2.1.0] - 2017-05-15

* Improve changelist workflow
* Add `annotate` support (#31)
* Support for shelved files (thanks @ihalip)
* Ignore files specified in settings and .p4ignore (#27, thanks @ihalip)
* Change extension category to `SCM Providers` (thanks @joaomoreno)

## [2.0.1] - 2017-04-09

* Display errors as status bar message (#33)
* Better compatibility with sourcedepot (#48, thanks @hoovercj)
* Improve performance on refresh (#50, #52, thanks @hoovercj)
* Configurable maxBuffer for commands (#53)
* Experimental: Resolve realpath before executing commands (#42, thanks @silenaker)

## [2.0.0] - 2017-04-07

* VS Code SCM Provider - beta (#39, 41, thanks @seanmcbreen, @joaomoreno)
* Better changelist support (#22, #32)
* Add submit support (#30)

## [1.1.0] - 2017-04-04

* Show revisions as QuickPick for diffRevision
* `login` and `logout` commands (#18)
* More robust file path handling (#38, #43, thanks @eeroh)
* ContentProvider for P4 operations

## [1.0.0] - 2017-01-01

* Convert plugin to use Typescript and overall refactor (#26, thanks @jel-massih)
* Use `onWillSaveTextDocument` event (#16, #25)
* No need for workspace folder to (#13, #29)

## [0.1.9] - 2016-09-23

* Fix issue #23 - error with `diff` keyboard shortcut

## [0.1.8] - 2016-07-11

* Add ability to configure the p4 client per workspace. (#19, thanks @ralberts)
* Add ability to diff specific revisions (#20, thanks @hoovercj)
* Add ability to see files opened in perforce and open one in the editor (#21, thanks @hoovercj)

## [0.1.7] - 2016-05-11

* the perforce command path can be configured in settings (#15, thanks @hoovercj)

## [0.1.6] - 2016-03-31

* Fix a temporary file issue on Windows

## [0.1.5] - 2016-03-30

* Show diff in a compare window
* Fix issue #10 - change warning boxes for status bar messages

## [0.1.4] - 2016-01-21

* Fix issue #9 - check for a valid p4 root before running automatic commands

## [0.1.3] - 2015-12-21

* status bar icons
* options to run `add`,`edit`,`delete` on file operations (thanks @jel-massih)

## [0.1.2] - 2015-11-18

* `info` to display client/server information
* Fix issue #2 - set open folder as working directory for `p4` commands

## [0.1.1] - 2015-11-15

* activationEvents (thanks @egamma)
* QuickPick on cancel

## [0.1.0] - 2015-11-14

* MIT License
* new icon
* vscode API 0.10.x

## [0.0.3] - 2015-10-18

* group commands in QuickPick

## [0.0.2] - 2015-10-18

* `add` command on a new file
* `diff` current file in output log
* icon

## [0.0.1] - 2015-10-18

* `edit` command on opened file
* `revert` command on opened file

[4.15.6]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.5...4.15.6
[4.15.5]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.4...4.15.5
[4.15.4]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.3...4.15.4
[4.15.3]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.2...4.15.3
[4.15.2]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.1...4.15.2
[4.15.1]: https://github.com/mjcrouch/vscode-perforce/compare/4.15.0...4.15.1
[4.15.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.14.0...4.15.0
[4.14.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.13.0...4.14.0
[4.13.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.12.0...4.13.0
[4.12.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.11.0...4.12.0
[4.11.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.10.0...4.11.0
[4.10.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.9.0...4.10.0
[4.9.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.8.2...4.9.0
[4.8.2]: https://github.com/mjcrouch/vscode-perforce/compare/4.8.1...4.8.2
[4.8.1]: https://github.com/mjcrouch/vscode-perforce/compare/4.8.0...4.8.1
[4.8.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.7.0...4.8.0
[4.7.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.6.0...4.7.0
[4.6.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.5.0...4.6.0
[4.5.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.4.2...4.5.0
[4.4.2]: https://github.com/mjcrouch/vscode-perforce/compare/4.4.1...4.4.2
[4.4.1]: https://github.com/mjcrouch/vscode-perforce/compare/4.4.0...4.4.1
[4.4.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.3.0...4.4.0
[4.3.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.2.0...4.3.0
[4.2.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.1.0...4.2.0
[4.1.0]: https://github.com/mjcrouch/vscode-perforce/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.10.0...4.0.0
[3.10.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.9.1...3.10.0
[3.9.1]: https://github.com/mjcrouch/vscode-perforce/compare/3.9.0...3.9.1
[3.9.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.8.0...3.9.0
[3.8.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.7.0...3.8.0
[3.7.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.6.2...3.7.0
[3.6.2]: https://github.com/mjcrouch/vscode-perforce/compare/3.6.1...3.6.2
[3.6.1]: https://github.com/mjcrouch/vscode-perforce/compare/3.6.0...3.6.1
[3.6.0]: https://github.com/mjcrouch/vscode-perforce/compare/3.5.2...3.6.0
[3.5.2]: https://github.com/mjcrouch/vscode-perforce/compare/3.5.1...3.5.2
[3.5.1]: https://github.com/mjcrouch/vscode-perforce/compare/3.5.0...3.5.1
[3.5.0]: https://github.com/mjcrouch/vscode-perforce/compare/6807513579057a52292f87d3ca58babf012cb906...33d036413600eaeeecd1425898d7615e472a7a6b
[3.1.0]: https://github.com/stef-levesque/vscode-perforce/compare/1fca898f1bceacf1135f044bee87983c59cbc87e...4af0dc0242d2e05f447c75420e76768f30d89469
[3.0.0]: https://github.com/stef-levesque/vscode-perforce/compare/7cf9e068708d0ccadda7201e862c835826ca35bf...b9192e2fb31ad615dace4b035adc0cb8e08f78c9
[2.2.2]: https://github.com/stef-levesque/vscode-perforce/compare/fc74e236c7c40525ad9101e1a9541b4963d36355...f953b90996f2420bb19b391708a624515d2b604f
[2.2.1]: https://github.com/stef-levesque/vscode-perforce/compare/dc1a00baebbb17f8ad754a0b13bf5438c49b0319...89a12db65daead7a7eb74577762b9ebd21bfe12d
[2.2.0]: https://github.com/stef-levesque/vscode-perforce/compare/51d8b0d7794deb7d382848e77821c9efffe7728a...85e34a85acfb68dae314846cb37aa2d0df6f2ef4
[2.1.1]: https://github.com/stef-levesque/vscode-perforce/compare/a990e0c936bbc9550785e0e126c91ac3f6ddb46e...101845c66cc94ff3fc957b1b0b5591f487958899
[2.1.0]: https://github.com/stef-levesque/vscode-perforce/compare/5dd2025bdcbc906fc77b4019fe92d2263c06bc00...61ff3b2a6dd1d32d3e572e788034fedd62455b35
[2.0.1]: https://github.com/stef-levesque/vscode-perforce/compare/1a08507ae3a0b825563d2c9444210194abf75962...852d772956b3e68baf06a064632b71e0f7c44444
[2.0.0]: https://github.com/stef-levesque/vscode-perforce/compare/a83bf106468feec7ed8c6aaac841487654eb0737...3fe2af32f4c4b6e34443e1baf0724984c76be69d
[1.1.0]: https://github.com/stef-levesque/vscode-perforce/compare/e08c66e833e8508fda4d190697934b5bb1a7a3d5...b143313ec7263d82fd40f6a32c3e366c0778998f
[1.0.0]: https://github.com/stef-levesque/vscode-perforce/compare/dc0542519de6249438582750cc928b70ac075114...e68aee4a38589ebfbb1346e945c117fcb111ac25
[0.1.9]: https://github.com/stef-levesque/vscode-perforce/compare/62008b25044c90cc382c2cc952e454591af78b47...c584470fe7a1328be3895c49242e543a3ed06d3c
[0.1.8]: https://github.com/stef-levesque/vscode-perforce/compare/2af4e1713633c96ed70ee8366fd533094377ef55...2da50c202f9c711a3b5e6e40d7333bf71cac1f90
[0.1.7]: https://github.com/stef-levesque/vscode-perforce/compare/cf189871bdc013e4342d5c3fd0ee485ddae4734e...1fbce841c7f52f65a00f1c25bc530b8c4296aafe
[0.1.6]: https://github.com/stef-levesque/vscode-perforce/compare/2915c7688d1c71dd1815350313f7d4344cab1607...b9bb4076beb62d47d17abfd8fc515058ab9f5adb
[0.1.5]: https://github.com/stef-levesque/vscode-perforce/compare/383da5048e342cbbe90ab4f74fecd0db9e3d85fc...faad0b0db08d87f04664dfa9bc8a3be3640c6311
[0.1.4]: https://github.com/stef-levesque/vscode-perforce/compare/168cd653195f33774f8c6c795ab29adba4bbe499...d07a5c45df1db65cf0335b5949a55077b84fe4b4
[0.1.3]: https://github.com/stef-levesque/vscode-perforce/compare/1e006e1c51640756b6e6cbd39a78d050e13f5f6a...168cd653195f33774f8c6c795ab29adba4bbe499
[0.1.2]: https://github.com/stef-levesque/vscode-perforce/compare/ada0c5a47eb39fd05cbd3d45433cd351f759f072...1e006e1c51640756b6e6cbd39a78d050e13f5f6a
[0.1.1]: https://github.com/stef-levesque/vscode-perforce/compare/afbe80a4549dad0f45410ab48ab3cf7e59497286...ada0c5a47eb39fd05cbd3d45433cd351f759f072
[0.1.0]: https://github.com/stef-levesque/vscode-perforce/compare/cc98c00da2aac4771f2c6923eb7d8dd968a0aa92...afbe80a4549dad0f45410ab48ab3cf7e59497286
[0.0.3]: https://github.com/stef-levesque/vscode-perforce/compare/d088f2844785e3c607a55e6a165f76e0179dc4c2...cc98c00da2aac4771f2c6923eb7d8dd968a0aa92
[0.0.2]: https://github.com/stef-levesque/vscode-perforce/compare/ec31157dee778c7a59cf86b7382f1d8a5c152736...d088f2844785e3c607a55e6a165f76e0179dc4c2
[0.0.1]: https://github.com/stef-levesque/vscode-perforce/commit/ec31157dee778c7a59cf86b7382f1d8a5c152736
