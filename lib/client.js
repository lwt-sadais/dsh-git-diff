window.__ModuleLoader__.load({
	id: "dsh-git-diff",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/assets/git-diff-toolbar.ts
		const gitDiffToolbarIcon = "data:image/png;base64,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";
		//#endregion
		//#region src/client/api.ts
		const FALLBACK = {
			ok: false,
			error: {
				code: "internal",
				message: "Git diff service is unavailable"
			}
		};
		async function readDiff(path, signal) {
			try {
				const value = await (await fetch("/api/dsh-git-diff/snapshot", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ path }),
					...signal === void 0 ? {} : { signal }
				})).json();
				if (value !== null && typeof value === "object" && "ok" in value) return value;
				return FALLBACK;
			} catch (cause) {
				if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
				return FALLBACK;
			}
		}
		//#endregion
		//#region src/client/GitDiffDock.tsx
		const STATUS_KEYS = {
			modified: "statusModified",
			added: "statusAdded",
			deleted: "statusDeleted",
			renamed: "statusRenamed",
			untracked: "statusUntracked"
		};
		function lineClass(line) {
			if (line.kind === "delete") return "dgdDelete";
			if (line.kind === "insert") return "dgdInsert";
			if (line.kind === "modify") return line.partnerKind === "delete" ? "dgdModifyDelete" : "dgdModifyInsert";
			if (line.kind === "empty") return "dgdEmpty";
			return "dgdEqual";
		}
		function RepositoryTree({ repository, activePath, expanded, onToggle, onSelect, t, depth = 0 }) {
			const root = repository.path === "";
			const open = root || expanded.has(repository.path);
			const changedCount = countRepositoryChanges(repository);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dgdTreeNode",
				children: [!root && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "dgdRepository",
					type: "button",
					onClick: () => onToggle(repository.path),
					style: { paddingLeft: `${10 + depth * 14}px` },
					title: repository.path,
					"aria-expanded": open,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdChevron",
							"aria-hidden": "true",
							children: open ? "⌄" : "›"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "▣"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdRepositoryName",
							children: repository.name
						}),
						!repository.initialized && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdSubmoduleState",
							children: "未初始化"
						}),
						repository.headChanged && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdSubmoduleState",
							children: "指针变动"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdTreeCount",
							children: changedCount
						})
					]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [repository.files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: `dgdFile ${file.path === activePath ? "dgdFileActive" : ""}`,
					type: "button",
					onClick: () => onSelect(file.path),
					title: file.path,
					style: { paddingLeft: `${10 + (root ? 0 : depth + 1) * 14}px` },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdStatus",
						children: t(STATUS_KEYS[file.status])
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdPath",
						children: file.repositoryRelativePath
					})]
				}, file.path)), repository.children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RepositoryTree, {
					repository: child,
					activePath,
					expanded,
					onToggle,
					onSelect,
					t,
					depth: root ? 0 : depth + 1
				}, child.path))] })]
			});
		}
		function countRepositoryChanges(repository) {
			return repository.files.length + (repository.headChanged ? 1 : 0) + repository.children.reduce((sum, child) => sum + countRepositoryChanges(child), 0);
		}
		function SelectedFileHeader({ file, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dgdSelectedFile",
				title: file.path,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdSelectedFileIcon",
						"aria-hidden": "true",
						children: "‹/›"
					}),
					file.oldPath !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdSelectedFileRename",
						children: file.oldPath
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "→"
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdSelectedFilePath",
						children: file.path
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dgdStatus",
						children: t(STATUS_KEYS[file.status])
					})
				]
			});
		}
		function DiffPane({ file, side, paneRef, onScroll, onSelect }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: paneRef,
				className: "dgdPane",
				onScroll,
				onMouseUp: onSelect,
				"data-side": side,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dgdRows",
					children: file.rows.map((row) => {
						const value = side === "before" ? row.left : row.right;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: `dgdLine ${lineClass(value)}`,
							"data-row": row.index,
							"data-line": value.lineNumber ?? "",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dgdLineNo",
								children: value.lineNumber ?? ""
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dgdCode",
								children: value.text || " "
							})]
						}, row.index);
					})
				})
			});
		}
		function formatReview(annotations) {
			const groups = /* @__PURE__ */ new Map();
			for (const annotation of annotations) groups.set(annotation.path, [...groups.get(annotation.path) ?? [], annotation]);
			const lines = ["## Git Diff 批注", ""];
			for (const [path, notes] of groups) {
				lines.push(`### \`${path}\``, "");
				for (const note of notes) {
					const range = note.startLine === note.endLine ? `L${note.startLine}` : `L${note.startLine}-L${note.endLine}`;
					lines.push(`- **${note.side === "before" ? "修改前" : "修改后"} ${range}**：${note.comment}`, "", "```", note.content, "```", "");
				}
			}
			return lines.join("\n").trim();
		}
		function selectedCode(file, side, pane) {
			const selection = window.getSelection();
			if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null;
			const range = selection.getRangeAt(0);
			const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
			const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
			const startRow = startElement?.closest(".dgdLine");
			const endRow = endElement?.closest(".dgdLine");
			if (startRow === null || startRow === void 0 || endRow === null || endRow === void 0 || !pane.contains(startRow) || !pane.contains(endRow)) return null;
			const first = Math.min(Number(startRow.dataset.row), Number(endRow.dataset.row));
			const last = Math.max(Number(startRow.dataset.row), Number(endRow.dataset.row));
			const values = file.rows.slice(first, last + 1).map((row) => side === "before" ? row.left : row.right).filter((line) => line.lineNumber !== null);
			if (values.length === 0) return null;
			return {
				path: file.path,
				side,
				startLine: values[0].lineNumber,
				endLine: values.at(-1).lineNumber,
				content: values.map((value) => value.text).join("\n")
			};
		}
		function GitDiffDock(props) {
			const { sessionId, useSessions, useInput, inputActions, t } = props;
			const cwd = useSessions((state) => sessionId === void 0 ? void 0 : state.byId[sessionId]?.cwd);
			const draft = useInput((state) => state.draft);
			const [open, setOpen] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [files, setFiles] = (0, react.useState)([]);
			const [repository, setRepository] = (0, react.useState)(null);
			const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [activePath, setActivePath] = (0, react.useState)(null);
			const [selection, setSelection] = (0, react.useState)(null);
			const [comment, setComment] = (0, react.useState)("");
			const [annotations, setAnnotations] = (0, react.useState)([]);
			const [sent, setSent] = (0, react.useState)(false);
			const leftRef = (0, react.useRef)(null);
			const rightRef = (0, react.useRef)(null);
			const syncing = (0, react.useRef)(false);
			const activeFile = (0, react.useMemo)(() => files.find((file) => file.path === activePath) ?? files[0], [activePath, files]);
			const load = (0, react.useCallback)(async (signal) => {
				if (cwd === void 0 || cwd === "") {
					setError(t("noWorkspace"));
					return;
				}
				setLoading(true);
				setError(null);
				const result = await readDiff(cwd, signal);
				if (!result.ok) setError(result.error.message);
				else {
					setFiles(result.value.files);
					setRepository(result.value.repository);
					setExpanded((current) => current.size === 0 ? new Set(result.value.repository.children.filter((child) => countRepositoryChanges(child) > 0).map((child) => child.path)) : current);
					setActivePath((current) => result.value.files.some((file) => file.path === current) ? current : result.value.files[0]?.path ?? null);
				}
				setLoading(false);
			}, [cwd, t]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const controller = new AbortController();
				load(controller.signal);
				return () => controller.abort();
			}, [load, open]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const keydown = (event) => {
					if (event.key !== "Escape") return;
					selection === null ? setOpen(false) : setSelection(null);
				};
				document.addEventListener("keydown", keydown);
				return () => document.removeEventListener("keydown", keydown);
			}, [open, selection]);
			(0, react.useEffect)(() => {
				setSelection(null);
				setComment("");
				if (leftRef.current) {
					leftRef.current.scrollTop = 0;
					leftRef.current.scrollLeft = 0;
				}
				if (rightRef.current) {
					rightRef.current.scrollTop = 0;
					rightRef.current.scrollLeft = 0;
				}
			}, [activeFile?.path]);
			const sync = (source, target) => {
				if (source === null || target === null || syncing.current) return;
				syncing.current = true;
				target.scrollTop = source.scrollTop;
				target.scrollLeft = source.scrollLeft;
				requestAnimationFrame(() => {
					syncing.current = false;
				});
			};
			const captureSelection = (side) => {
				if (activeFile === void 0) return;
				const pane = side === "before" ? leftRef.current : rightRef.current;
				if (pane === null) return;
				const next = selectedCode(activeFile, side, pane);
				if (next !== null) {
					setSelection(next);
					setComment("");
					setSent(false);
				}
			};
			const saveAnnotation = () => {
				const text = comment.trim();
				if (selection === null || text === "") return;
				setAnnotations((current) => [...current, {
					...selection,
					id: crypto.randomUUID(),
					comment: text
				}]);
				setSelection(null);
				setComment("");
				window.getSelection()?.removeAllRanges();
			};
			const sendToChat = () => {
				if (annotations.length === 0) return;
				const review = formatReview(annotations);
				inputActions.setDraft(draft.trim() === "" ? review : `${draft.trimEnd()}\n\n${review}`);
				setSent(true);
				setSelection(null);
				setComment("");
				window.getSelection()?.removeAllRanges();
				setOpen(false);
			};
			const locate = (row) => {
				const top = row * 20;
				leftRef.current?.scrollTo({
					top: Math.max(0, top - leftRef.current.clientHeight / 2),
					behavior: "smooth"
				});
				rightRef.current?.scrollTo({
					top: Math.max(0, top - rightRef.current.clientHeight / 2),
					behavior: "smooth"
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dgdDock",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("button"),
					side: "top",
					delayMs: 500,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dgdLauncher",
						onClick: () => {
							setOpen(true);
							setSent(false);
						},
						"aria-label": t("button"),
						title: t("button"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: "dgdLauncherIcon",
							src: gitDiffToolbarIcon,
							alt: "",
							"aria-hidden": "true"
						})
					})
				}), open && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dgdOverlay",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("title"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dgdMask",
						type: "button",
						onClick: () => setOpen(false),
						"aria-label": t("close")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dgdPanel",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
								className: "dgdHeader",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("subtitle") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dgdHeaderActions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "dgdSecondary",
										type: "button",
										onClick: () => void load(),
										disabled: loading,
										children: t("refresh")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "dgdIconButton",
										type: "button",
										onClick: () => setOpen(false),
										"aria-label": t("close"),
										children: "×"
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dgdBody",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
									className: "dgdFiles",
									children: repository !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RepositoryTree, {
										repository,
										activePath: activeFile?.path ?? null,
										expanded,
										onToggle: (path) => setExpanded((current) => {
											const next = new Set(current);
											next.has(path) ? next.delete(path) : next.add(path);
											return next;
										}),
										onSelect: setActivePath,
										t
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
									className: "dgdMain",
									children: [loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dgdCenter",
										children: t("loading")
									}) : error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dgdCenter",
										role: "alert",
										children: error
									}) : activeFile === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dgdCenter",
										children: t("empty")
									}) : activeFile.binary ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectedFileHeader, {
										file: activeFile,
										t
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dgdCenter",
										children: t("binary")
									})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectedFileHeader, {
											file: activeFile,
											t
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dgdColumnsHead",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("before") }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("after") }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {})
											]
										}),
										activeFile.truncated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dgdNotice",
											children: t("truncated")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dgdDiffViewport",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffPane, {
													file: activeFile,
													side: "before",
													paneRef: leftRef,
													onScroll: () => sync(leftRef.current, rightRef.current),
													onSelect: () => captureSelection("before")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffPane, {
													file: activeFile,
													side: "after",
													paneRef: rightRef,
													onScroll: () => sync(rightRef.current, leftRef.current),
													onSelect: () => captureSelection("after")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: "dgdIndicator",
													onClick: (event) => locate(Math.round(event.nativeEvent.offsetY / event.currentTarget.clientHeight * Math.max(0, activeFile.rows.length - 1))),
													children: activeFile.markers.map((marker, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: `dgdMarker ${marker.kind === "delete" ? "dgdMarkerDelete" : "dgdMarkerInsert"}`,
														style: { top: `${marker.row / Math.max(1, activeFile.rows.length) * 100}%` },
														onClick: (event) => {
															event.stopPropagation();
															locate(marker.row);
														},
														"aria-label": `${marker.kind} ${marker.row + 1}`
													}, `${marker.row}-${marker.kind}-${index}`))
												}),
												selection !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "dgdAnnotationComposer",
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															className: "dgdSelection",
															children: selection.content
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
															autoFocus: true,
															value: comment,
															onChange: (event) => setComment(event.target.value),
															placeholder: t("annotationPlaceholder")
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
															className: "dgdAnnotationActions",
															children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																className: "dgdSecondary",
																type: "button",
																onClick: () => setSelection(null),
																children: t("cancel")
															}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																className: "dgdPrimary",
																type: "button",
																onClick: saveAnnotation,
																disabled: comment.trim() === "",
																children: t("saveAnnotation")
															})]
														})
													]
												})
											]
										})
									] }), annotations.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dgdAnnotations",
										children: annotations.map((annotation) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dgdAnnotation",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "dgdAnnotationRef",
													children: [
														annotation.path,
														":",
														annotation.startLine,
														"-",
														annotation.endLine
													]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: annotation.comment }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: "dgdRemove",
													type: "button",
													onClick: () => setAnnotations((current) => current.filter((item) => item.id !== annotation.id)),
													children: t("removeAnnotation")
												})
											]
										}, annotation.id))
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
								className: "dgdFooter",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: sent ? "dgdToast" : "",
									children: sent ? t("sentToChat") : annotations.length > 0 ? t("annotationCount", { count: annotations.length }) : t("selectionHint")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dgdFooterActions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("fileCount", { count: files.length }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "dgdPrimary",
										type: "button",
										disabled: annotations.length === 0,
										onClick: sendToChat,
										children: t("sendToChat")
									})]
								})]
							})
						]
					})]
				}), document.body)]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		const zh = {
			button: "Git Diff",
			title: "本地改动审阅",
			subtitle: "选择代码内容并添加批注，批注会回填到聊天输入框。",
			close: "关闭",
			refresh: "刷新",
			loading: "正在读取本地改动…",
			empty: "当前工作区没有本地改动",
			before: "修改前",
			after: "修改后",
			binary: "二进制文件不支持文本对比",
			truncated: "文件过大，仅显示前 2 MiB",
			selectionHint: "在任意一列拖动选择内容，然后添加批注",
			annotate: "添加批注",
			annotationPlaceholder: "请输入针对所选内容的批注…",
			saveAnnotation: "保存批注",
			cancel: "取消",
			annotations: "批注",
			removeAnnotation: "删除批注",
			sendToChat: "发送到会话",
			sentToChat: "批注已添加到输入框，请检查后自行发送。",
			selectTextFirst: "请先选择文件内容",
			fileCount: "{count} 个文件",
			annotationCount: "{count} 条批注",
			noWorkspace: "当前会话没有工作区",
			statusModified: "修改",
			statusAdded: "新增",
			statusDeleted: "删除",
			statusRenamed: "重命名",
			statusUntracked: "未跟踪"
		};
		const en = {
			button: "Git Diff",
			title: "Review local changes",
			subtitle: "Select code and annotate it, then insert the review into the chat draft.",
			close: "Close",
			refresh: "Refresh",
			loading: "Reading local changes…",
			empty: "No local changes in this workspace",
			before: "Before",
			after: "After",
			binary: "Binary files cannot be compared as text",
			truncated: "Large file: showing the first 2 MiB",
			selectionHint: "Select content in either column, then add an annotation",
			annotate: "Add annotation",
			annotationPlaceholder: "Comment on the selected content…",
			saveAnnotation: "Save annotation",
			cancel: "Cancel",
			annotations: "Annotations",
			removeAnnotation: "Remove annotation",
			sendToChat: "Send to conversation",
			sentToChat: "Annotations were added to the draft. Review and send them yourself.",
			selectTextFirst: "Select file content first",
			fileCount: "{count} files",
			annotationCount: "{count} annotations",
			noWorkspace: "The current session has no workspace",
			statusModified: "Modified",
			statusAdded: "Added",
			statusDeleted: "Deleted",
			statusRenamed: "Renamed",
			statusUntracked: "Untracked"
		};
		//#endregion
		//#region src/client/styles.css?inline
		var styles_default = ".dgdDock {\n  display: contents;\n}\n\n.dgdLauncher {\n  width: 28px;\n  height: 28px;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 999px;\n  justify-content: center;\n  align-items: center;\n  padding: 0;\n  font-size: 16px;\n  font-weight: 600;\n  display: inline-flex;\n}\n\n.dgdLauncher:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dgdLauncherIcon {\n  object-fit: contain;\n  pointer-events: none;\n  width: 18px;\n  height: 18px;\n  display: block;\n}\n\n.dgdOverlay, .dgdOverlay * {\n  box-sizing: border-box;\n}\n\n.dgdOverlay {\n  z-index: 2147483000;\n  justify-content: center;\n  align-items: center;\n  padding: 24px;\n  display: flex;\n  position: fixed;\n  inset: 0;\n}\n\n.dgdMask {\n  backdrop-filter: blur(4px);\n  background: #05070c99;\n  border: 0;\n  position: absolute;\n  inset: 0;\n}\n\n.dgdPanel {\n  background: var(--dsw-alias-bg-base);\n  width: min(1500px, 100vw - 48px);\n  height: min(900px, 100vh - 48px);\n  color: var(--dsw-alias-label-primary);\n  border: 1px solid var(--dsw-alias-border-l2);\n  box-shadow: var(--dsw-shadow-lv4);\n  border-radius: 16px;\n  flex-direction: column;\n  display: flex;\n  position: relative;\n  overflow: hidden;\n}\n\n.dgdHeader {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  flex: none;\n  justify-content: space-between;\n  align-items: center;\n  height: 68px;\n  padding: 0 20px;\n  display: flex;\n}\n\n.dgdHeader h2 {\n  margin: 0;\n  font-size: 17px;\n}\n\n.dgdHeader p {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 4px 0 0;\n  font-size: 12px;\n}\n\n.dgdHeaderActions, .dgdFooterActions {\n  align-items: center;\n  gap: 8px;\n  display: flex;\n}\n\n.dgdIconButton, .dgdSecondary, .dgdPrimary {\n  border: 1px solid var(--dsw-alias-border-l1);\n  color: inherit;\n  cursor: pointer;\n  background: none;\n  border-radius: 8px;\n  height: 32px;\n  padding: 0 12px;\n}\n\n.dgdIconButton {\n  width: 32px;\n  padding: 0;\n  font-size: 19px;\n}\n\n.dgdPrimary {\n  background: var(--dsw-alias-state-business-primary);\n  color: #fff;\n  border-color: #0000;\n  font-weight: 600;\n}\n\n.dgdPrimary:disabled {\n  background: var(--dsw-alias-interactive-bg-disabled);\n  color: var(--dsw-alias-label-dimmed);\n  cursor: not-allowed;\n}\n\n.dgdBody {\n  flex: 1;\n  grid-template-columns: 250px minmax(0, 1fr);\n  min-height: 0;\n  display: grid;\n}\n\n.dgdFiles {\n  border-right: 1px solid var(--dsw-alias-border-l1);\n  min-height: 0;\n  padding: 10px;\n  overflow: auto;\n}\n\n.dgdTreeNode {\n  min-width: 0;\n}\n\n.dgdRepository {\n  width: 100%;\n  height: 32px;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  text-align: left;\n  background: none;\n  border: 0;\n  border-radius: 7px;\n  align-items: center;\n  gap: 7px;\n  padding-right: 8px;\n  display: flex;\n}\n\n.dgdRepository:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.dgdChevron {\n  width: 12px;\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-size: 16px;\n}\n\n.dgdRepositoryName {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  font: 12px/20px var(--ds-font-family-code);\n  flex: 1;\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.dgdSubmoduleState {\n  color: var(--dsw-alias-state-warn-primary);\n  background: var(--dsw-alias-state-warn-tertiary);\n  border-radius: 4px;\n  flex: none;\n  padding: 0 4px;\n  font-size: 9px;\n  line-height: 16px;\n}\n\n.dgdTreeCount {\n  text-align: center;\n  min-width: 20px;\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-size: 10px;\n}\n\n.dgdFile {\n  width: 100%;\n  color: var(--dsw-alias-label-secondary);\n  text-align: left;\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 8px;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 10px;\n  display: flex;\n}\n\n.dgdFile:hover, .dgdFileActive {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dgdStatus {\n  background: var(--dsw-alias-interactive-bg-hover-solid);\n  border-radius: 4px;\n  flex: none;\n  padding: 2px 5px;\n  font-size: 10px;\n}\n\n.dgdPath {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-family: var(--ds-font-family-code);\n  font-size: 12px;\n  overflow: hidden;\n}\n\n.dgdMain {\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  display: flex;\n}\n\n.dgdSelectedFile {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  height: 38px;\n  font: 12px/20px var(--ds-font-family-code);\n  flex: none;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  padding: 0 14px;\n  display: flex;\n}\n\n.dgdSelectedFileIcon {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-weight: 700;\n}\n\n.dgdSelectedFilePath {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.dgdSelectedFileRename {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  max-width: 32%;\n  color: var(--dsw-alias-label-tertiary);\n  text-decoration: line-through;\n  overflow: hidden;\n}\n\n.dgdColumnsHead {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-specific-tip);\n  flex: none;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;\n  height: 42px;\n  display: grid;\n}\n\n.dgdColumnsHead span {\n  padding: 11px 14px;\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.dgdColumnsHead span + span {\n  border-left: 1px solid var(--dsw-alias-border-l1);\n}\n\n.dgdDiffViewport {\n  flex: 1;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;\n  min-height: 0;\n  display: grid;\n  position: relative;\n}\n\n.dgdPane {\n  min-width: 0;\n  font: 12px/20px var(--ds-font-family-code);\n  overscroll-behavior: contain;\n  overflow: auto;\n}\n\n.dgdPane + .dgdPane {\n  border-left: 1px solid var(--dsw-alias-border-l1);\n}\n\n.dgdRows {\n  width: 100%;\n  min-width: max-content;\n}\n\n.dgdLine {\n  white-space: pre;\n  grid-template-columns: 52px minmax(max-content, 1fr);\n  height: 20px;\n  display: grid;\n}\n\n.dgdLineNo {\n  text-align: right;\n  color: var(--dsw-alias-label-caption);\n  background: inherit;\n  user-select: none;\n  border-right: 1px solid #8882;\n  padding: 0 8px;\n  position: sticky;\n  left: 0;\n}\n\n.dgdCode {\n  padding: 0 10px;\n}\n\n.dgdEqual {\n  background: none;\n}\n\n.dgdDelete {\n  background: #f851492e;\n}\n\n.dgdInsert {\n  background: #2ea0432e;\n}\n\n.dgdModifyDelete {\n  background: linear-gradient(90deg, #f8514940 0, #f8514928 85%, #f8514916 100%);\n}\n\n.dgdModifyInsert {\n  background: linear-gradient(90deg, #2ea04316 0, #2ea04328 15%, #2ea04340 100%);\n}\n\n.dgdEmpty {\n  background: repeating-linear-gradient(135deg, #8881 0 4px, #0000 4px 8px);\n}\n\n.dgdIndicator {\n  background: var(--dsw-specific-tip);\n  border-left: 1px solid var(--dsw-alias-border-l1);\n  cursor: pointer;\n  position: relative;\n}\n\n.dgdMarker {\n  cursor: pointer;\n  border: 0;\n  border-radius: 2px;\n  min-height: 3px;\n  padding: 0;\n  position: absolute;\n  left: 4px;\n  right: 4px;\n}\n\n.dgdMarkerDelete {\n  background: #f85149;\n}\n\n.dgdMarkerInsert {\n  background: #2ea043;\n}\n\n.dgdCenter {\n  min-height: 0;\n  color: var(--dsw-alias-label-tertiary);\n  text-align: center;\n  justify-content: center;\n  align-items: center;\n  padding: 30px;\n  display: flex;\n}\n\n.dgdNotice {\n  background: var(--dsw-alias-state-warn-tertiary);\n  color: var(--dsw-alias-state-warn-primary);\n  flex: none;\n  padding: 7px 14px;\n  font-size: 11px;\n}\n\n.dgdAnnotationComposer {\n  z-index: 3;\n  background: var(--dsw-specific-input-major);\n  border: 1px solid var(--dsw-alias-border-l2);\n  width: 340px;\n  box-shadow: var(--dsw-shadow-lv3);\n  border-radius: 12px;\n  padding: 12px;\n  position: absolute;\n  bottom: 16px;\n  right: 34px;\n}\n\n.dgdSelection {\n  font: 11px/17px var(--ds-font-family-code);\n  white-space: pre-wrap;\n  background: var(--dsw-specific-tip);\n  border-radius: 6px;\n  max-height: 86px;\n  margin-bottom: 8px;\n  padding: 8px;\n  overflow: auto;\n}\n\n.dgdAnnotationComposer textarea {\n  resize: vertical;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  width: 100%;\n  height: 82px;\n  color: inherit;\n  border-radius: 7px;\n  outline: none;\n  padding: 8px;\n}\n\n.dgdAnnotationComposer textarea:focus {\n  border-color: var(--dsw-alias-state-business-primary);\n}\n\n.dgdAnnotationActions {\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 8px;\n  display: flex;\n}\n\n.dgdAnnotations {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  flex: none;\n  max-height: 120px;\n  padding: 8px 14px;\n  overflow: auto;\n}\n\n.dgdAnnotation {\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 0;\n  font-size: 11px;\n  display: grid;\n}\n\n.dgdAnnotationRef {\n  font-family: var(--ds-font-family-code);\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dgdRemove {\n  color: var(--dsw-alias-state-error-primary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n}\n\n.dgdFooter {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  height: 58px;\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 16px;\n  font-size: 12px;\n  display: flex;\n}\n\n.dgdToast {\n  color: var(--dsw-alias-state-success-primary);\n}\n\n@media (width <= 760px) {\n  .dgdOverlay {\n    padding: 0;\n  }\n\n  .dgdPanel {\n    border-radius: 0;\n    width: 100vw;\n    height: 100vh;\n  }\n\n  .dgdBody {\n    grid-template-columns: 1fr;\n  }\n\n  .dgdFiles {\n    border-right: 0;\n    border-bottom: 1px solid var(--dsw-alias-border-l1);\n    max-height: 120px;\n  }\n\n  .dgdHeader p {\n    display: none;\n  }\n}\n";
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots", "locale"];
		const NS = "git-diff";
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshGitDiff = "";
				style.textContent = styles_default;
				document.head.appendChild(style);
				return () => style.remove();
			}, "dsh-git-diff: styles");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-git-diff: dictionaries");
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "git-diff",
				order: 2,
				locale: NS
			}, GitDiffDock));
		}
		//#endregion
		exports.GitDiffDock = GitDiffDock;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map