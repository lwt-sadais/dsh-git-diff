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
		const gitDiffToolbarIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAU0lEQVR4nGP8//8/AyWAiSLdg8IAFgYGBlggMGKRJyjHRKkLmPDYwIDDVhRXsaA7CQmgG/ofjc1ItUBkINIbjNgClQlKE5scGZE0UycWGEfzAgMAsZoRH+edohgAAAAASUVORK5CYII=";
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
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dgdLauncher",
						onClick: () => {
							setOpen(true);
							setSent(false);
						},
						"aria-label": t("button"),
						title: t("button"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: "dgdLauncherIcon",
							src: gitDiffToolbarIcon,
							alt: "",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dgdLauncherLabel",
							children: "Git Diff"
						})]
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
		var styles_default = ".dgdDock {\n  display: contents;\n}\n\n.dgdLauncher {\n  width: auto;\n  height: 28px;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  white-space: nowrap;\n  background: none;\n  border: 0;\n  border-radius: 999px;\n  flex: none;\n  justify-content: center;\n  align-items: center;\n  gap: 5px;\n  padding: 0 8px 0 6px;\n  font-size: 12px;\n  font-weight: 500;\n  line-height: 20px;\n  display: inline-flex;\n}\n\n.dgdLauncher:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dgdLauncherIcon {\n  object-fit: contain;\n  width: 16px;\n  height: 16px;\n  image-rendering: pixelated;\n  pointer-events: none;\n  flex: none;\n  display: block;\n}\n\n.dgdLauncherLabel {\n  white-space: nowrap;\n  word-break: keep-all;\n  line-height: 20px;\n  display: block;\n}\n\n.dgdOverlay, .dgdOverlay * {\n  box-sizing: border-box;\n}\n\n.dgdOverlay {\n  z-index: 2147483000;\n  justify-content: center;\n  align-items: center;\n  padding: 24px;\n  display: flex;\n  position: fixed;\n  inset: 0;\n}\n\n.dgdMask {\n  backdrop-filter: blur(4px);\n  background: #05070c99;\n  border: 0;\n  position: absolute;\n  inset: 0;\n}\n\n.dgdPanel {\n  background: var(--dsw-alias-bg-base);\n  width: min(1500px, 100vw - 48px);\n  height: min(900px, 100vh - 48px);\n  color: var(--dsw-alias-label-primary);\n  border: 1px solid var(--dsw-alias-border-l2);\n  box-shadow: var(--dsw-shadow-lv4);\n  border-radius: 16px;\n  flex-direction: column;\n  display: flex;\n  position: relative;\n  overflow: hidden;\n}\n\n.dgdHeader {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  flex: none;\n  justify-content: space-between;\n  align-items: center;\n  height: 68px;\n  padding: 0 20px;\n  display: flex;\n}\n\n.dgdHeader h2 {\n  margin: 0;\n  font-size: 17px;\n}\n\n.dgdHeader p {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 4px 0 0;\n  font-size: 12px;\n}\n\n.dgdHeaderActions, .dgdFooterActions {\n  align-items: center;\n  gap: 8px;\n  display: flex;\n}\n\n.dgdIconButton, .dgdSecondary, .dgdPrimary {\n  border: 1px solid var(--dsw-alias-border-l1);\n  color: inherit;\n  cursor: pointer;\n  background: none;\n  border-radius: 8px;\n  height: 32px;\n  padding: 0 12px;\n}\n\n.dgdIconButton {\n  width: 32px;\n  padding: 0;\n  font-size: 19px;\n}\n\n.dgdPrimary {\n  background: var(--dsw-alias-state-business-primary);\n  color: #fff;\n  border-color: #0000;\n  font-weight: 600;\n}\n\n.dgdPrimary:disabled {\n  background: var(--dsw-alias-interactive-bg-disabled);\n  color: var(--dsw-alias-label-dimmed);\n  cursor: not-allowed;\n}\n\n.dgdBody {\n  flex: 1;\n  grid-template-columns: 250px minmax(0, 1fr);\n  min-height: 0;\n  display: grid;\n}\n\n.dgdFiles {\n  border-right: 1px solid var(--dsw-alias-border-l1);\n  min-height: 0;\n  padding: 10px;\n  overflow: auto;\n}\n\n.dgdTreeNode {\n  min-width: 0;\n}\n\n.dgdRepository {\n  width: 100%;\n  height: 32px;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  text-align: left;\n  background: none;\n  border: 0;\n  border-radius: 7px;\n  align-items: center;\n  gap: 7px;\n  padding-right: 8px;\n  display: flex;\n}\n\n.dgdRepository:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.dgdChevron {\n  width: 12px;\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-size: 16px;\n}\n\n.dgdRepositoryName {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  font: 12px/20px var(--ds-font-family-code);\n  flex: 1;\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.dgdSubmoduleState {\n  color: var(--dsw-alias-state-warn-primary);\n  background: var(--dsw-alias-state-warn-tertiary);\n  border-radius: 4px;\n  flex: none;\n  padding: 0 4px;\n  font-size: 9px;\n  line-height: 16px;\n}\n\n.dgdTreeCount {\n  text-align: center;\n  min-width: 20px;\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-size: 10px;\n}\n\n.dgdFile {\n  width: 100%;\n  color: var(--dsw-alias-label-secondary);\n  text-align: left;\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 8px;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 10px;\n  display: flex;\n}\n\n.dgdFile:hover, .dgdFileActive {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dgdStatus {\n  background: var(--dsw-alias-interactive-bg-hover-solid);\n  border-radius: 4px;\n  flex: none;\n  padding: 2px 5px;\n  font-size: 10px;\n}\n\n.dgdPath {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-family: var(--ds-font-family-code);\n  font-size: 12px;\n  overflow: hidden;\n}\n\n.dgdMain {\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  display: flex;\n}\n\n.dgdSelectedFile {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  height: 38px;\n  font: 12px/20px var(--ds-font-family-code);\n  flex: none;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  padding: 0 14px;\n  display: flex;\n}\n\n.dgdSelectedFileIcon {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-weight: 700;\n}\n\n.dgdSelectedFilePath {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.dgdSelectedFileRename {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  max-width: 32%;\n  color: var(--dsw-alias-label-tertiary);\n  text-decoration: line-through;\n  overflow: hidden;\n}\n\n.dgdColumnsHead {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-specific-tip);\n  flex: none;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;\n  height: 42px;\n  display: grid;\n}\n\n.dgdColumnsHead span {\n  padding: 11px 14px;\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.dgdColumnsHead span + span {\n  border-left: 1px solid var(--dsw-alias-border-l1);\n}\n\n.dgdDiffViewport {\n  flex: 1;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;\n  min-height: 0;\n  display: grid;\n  position: relative;\n}\n\n.dgdPane {\n  min-width: 0;\n  font: 12px/20px var(--ds-font-family-code);\n  overscroll-behavior: contain;\n  overflow: auto;\n}\n\n.dgdPane + .dgdPane {\n  border-left: 1px solid var(--dsw-alias-border-l1);\n}\n\n.dgdRows {\n  width: 100%;\n  min-width: max-content;\n}\n\n.dgdLine {\n  white-space: pre;\n  grid-template-columns: 52px minmax(max-content, 1fr);\n  height: 20px;\n  display: grid;\n}\n\n.dgdLineNo {\n  text-align: right;\n  color: var(--dsw-alias-label-caption);\n  background: inherit;\n  user-select: none;\n  border-right: 1px solid #8882;\n  padding: 0 8px;\n  position: sticky;\n  left: 0;\n}\n\n.dgdCode {\n  padding: 0 10px;\n}\n\n.dgdEqual {\n  background: none;\n}\n\n.dgdDelete {\n  background: #f851492e;\n}\n\n.dgdInsert {\n  background: #2ea0432e;\n}\n\n.dgdModifyDelete {\n  background: linear-gradient(90deg, #f8514940 0, #f8514928 85%, #f8514916 100%);\n}\n\n.dgdModifyInsert {\n  background: linear-gradient(90deg, #2ea04316 0, #2ea04328 15%, #2ea04340 100%);\n}\n\n.dgdEmpty {\n  background: repeating-linear-gradient(135deg, #8881 0 4px, #0000 4px 8px);\n}\n\n.dgdIndicator {\n  background: var(--dsw-specific-tip);\n  border-left: 1px solid var(--dsw-alias-border-l1);\n  cursor: pointer;\n  position: relative;\n}\n\n.dgdMarker {\n  cursor: pointer;\n  border: 0;\n  border-radius: 2px;\n  min-height: 3px;\n  padding: 0;\n  position: absolute;\n  left: 4px;\n  right: 4px;\n}\n\n.dgdMarkerDelete {\n  background: #f85149;\n}\n\n.dgdMarkerInsert {\n  background: #2ea043;\n}\n\n.dgdCenter {\n  min-height: 0;\n  color: var(--dsw-alias-label-tertiary);\n  text-align: center;\n  justify-content: center;\n  align-items: center;\n  padding: 30px;\n  display: flex;\n}\n\n.dgdNotice {\n  background: var(--dsw-alias-state-warn-tertiary);\n  color: var(--dsw-alias-state-warn-primary);\n  flex: none;\n  padding: 7px 14px;\n  font-size: 11px;\n}\n\n.dgdAnnotationComposer {\n  z-index: 3;\n  background: var(--dsw-specific-input-major);\n  border: 1px solid var(--dsw-alias-border-l2);\n  width: 340px;\n  box-shadow: var(--dsw-shadow-lv3);\n  border-radius: 12px;\n  padding: 12px;\n  position: absolute;\n  bottom: 16px;\n  right: 34px;\n}\n\n.dgdSelection {\n  font: 11px/17px var(--ds-font-family-code);\n  white-space: pre-wrap;\n  background: var(--dsw-specific-tip);\n  border-radius: 6px;\n  max-height: 86px;\n  margin-bottom: 8px;\n  padding: 8px;\n  overflow: auto;\n}\n\n.dgdAnnotationComposer textarea {\n  resize: vertical;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  width: 100%;\n  height: 82px;\n  color: inherit;\n  border-radius: 7px;\n  outline: none;\n  padding: 8px;\n}\n\n.dgdAnnotationComposer textarea:focus {\n  border-color: var(--dsw-alias-state-business-primary);\n}\n\n.dgdAnnotationActions {\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 8px;\n  display: flex;\n}\n\n.dgdAnnotations {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  flex: none;\n  max-height: 120px;\n  padding: 8px 14px;\n  overflow: auto;\n}\n\n.dgdAnnotation {\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 0;\n  font-size: 11px;\n  display: grid;\n}\n\n.dgdAnnotationRef {\n  font-family: var(--ds-font-family-code);\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dgdRemove {\n  color: var(--dsw-alias-state-error-primary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n}\n\n.dgdFooter {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  height: 58px;\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 16px;\n  font-size: 12px;\n  display: flex;\n}\n\n.dgdToast {\n  color: var(--dsw-alias-state-success-primary);\n}\n\n@media (width <= 760px) {\n  .dgdOverlay {\n    padding: 0;\n  }\n\n  .dgdPanel {\n    border-radius: 0;\n    width: 100vw;\n    height: 100vh;\n  }\n\n  .dgdBody {\n    grid-template-columns: 1fr;\n  }\n\n  .dgdFiles {\n    border-right: 0;\n    border-bottom: 1px solid var(--dsw-alias-border-l1);\n    max-height: 120px;\n  }\n\n  .dgdHeader p {\n    display: none;\n  }\n}\n";
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