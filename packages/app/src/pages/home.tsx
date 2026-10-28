import { createMemo, For, Match, Switch } from "solid-js"
import { Button } from "@cyberstrike-io/ui/button"
import { useLayout } from "@/context/layout"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@cyberstrike-io/util/encode"
import { Icon } from "@cyberstrike-io/ui/icon"
import { usePlatform } from "@/context/platform"
import { DateTime } from "luxon"
import { useDialog } from "@cyberstrike-io/ui/context/dialog"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"
import { DialogSelectServer } from "@/components/dialog-select-server"
import { useServer } from "@/context/server"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"

export default function Home() {
  const sync = useGlobalSync()
  const layout = useLayout()
  const platform = usePlatform()
  const dialog = useDialog()
  const navigate = useNavigate()
  const server = useServer()
  const language = useLanguage()
  const homedir = createMemo(() => sync.data.path.home)
  const recent = createMemo(() => {
    return sync.data.project
      .slice()
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
      .slice(0, 5)
  })

  const serverDotClass = createMemo(() => {
    const healthy = server.healthy()
    if (healthy === true) return "ln-status-dot ln-status-dot--ok"
    if (healthy === false) return "ln-status-dot ln-status-dot--error"
    return "ln-status-dot ln-status-dot--unknown"
  })

  function openProject(directory: string) {
    layout.projects.open(directory)
    server.projects.touch(directory)
    navigate(`/${base64Encode(directory)}`)
  }

  async function chooseProject() {
    function resolve(result: string | string[] | null) {
      if (Array.isArray(result)) {
        for (const directory of result) openProject(directory)
      } else if (result) {
        openProject(result)
      }
    }

    if (platform.openDirectoryPickerDialog && server.isLocal()) {
      const result = await platform.openDirectoryPickerDialog?.({
        title: language.t("command.project.open"),
        multiple: true,
      })
      resolve(result)
    } else {
      dialog.show(
        () => <DialogSelectDirectory multiple={true} onSelect={resolve} />,
        () => resolve(null),
      )
    }
  }

  return (
    <main class="ln-console">
      <header class="ln-topbar">
        <div class="ln-brand">
          <div class="ln-brand-mark" aria-hidden="true">
            <span>CS</span>
          </div>
          <div class="ln-brand-copy">
            <div class="ln-brand-title">辽宁省某单位网络安全检测与研判平台</div>
            <div class="ln-brand-subtitle">网络安全检测 · 智能辅助研判 · 工作区管理</div>
          </div>
        </div>
        <div class="ln-topbar-right">
          <div class="ln-env-chip"><span class={serverDotClass()} />{server.name}</div>
          <Button
            size="normal"
            variant="ghost"
            class="ln-server-switch"
            onClick={() => dialog.show(() => <DialogSelectServer />)}
          >
            <Icon name="server" size="small" />
            切换服务
          </Button>
        </div>
      </header>

      <div class="ln-content">
        <section class="ln-hero">
          <div class="ln-hero-grid" aria-hidden="true" />
          <div class="ln-hero-copy">
            <div class="ln-eyebrow"><span class="ln-eyebrow-line" />安全工作台 <span class="ln-eyebrow-en">SECURITY OPERATIONS</span></div>
            <h1>网络安全检测与研判</h1>
            <p>统一管理分析工作区，通过智能体辅助开展代码审查、技术分析与安全问题研判。</p>
            <div class="ln-hero-actions">
              <Button size="large" class="ln-primary-action" onClick={chooseProject}>
                <Icon name="folder-add-left" size="small" />
                打开工作区
                <span class="ln-action-arrow">↗</span>
              </Button>
              <span class="ln-action-note">选择已有项目目录，或连接远程服务</span>
            </div>
          </div>
          <div class="ln-hero-visual" aria-hidden="true">
            <div class="ln-orbit ln-orbit-outer" />
            <div class="ln-orbit ln-orbit-inner" />
            <div class="ln-core-shield"><span>CS</span></div>
            <div class="ln-orbit-point ln-point-a" />
            <div class="ln-orbit-point ln-point-b" />
            <div class="ln-orbit-point ln-point-c" />
            <div class="ln-visual-label ln-visual-label-top">DETECTION</div>
            <div class="ln-visual-label ln-visual-label-bottom">ANALYSIS / REVIEW</div>
          </div>
          <div class="ln-hero-footer">
            <span><i class="ln-mini-dot" />工作区与会话</span>
            <span>授权范围内开展分析操作</span>
            <span class="ln-build-label">CYBERSTRIKE WORKSPACE</span>
          </div>
        </section>

        <section class="ln-overview">
          <div class="ln-section-heading">
            <div>
              <div class="ln-section-kicker">WORKSPACE OVERVIEW</div>
              <h2>工作区概览</h2>
            </div>
            <div class="ln-section-meta">数据来源：当前服务同步信息</div>
          </div>
          <div class="ln-metric-grid">
            <article class="ln-metric-card">
              <div class="ln-metric-icon ln-icon-blue"><Icon name="folder" size="large" /></div>
              <div class="ln-metric-label">已关联工作区</div>
              <div class="ln-metric-value">{sync.data.project.length}<span>个</span></div>
              <div class="ln-metric-foot">当前服务已同步的项目</div>
            </article>
            <article class="ln-metric-card">
              <div class="ln-metric-icon ln-icon-cyan"><Icon name="activity" size="large" /></div>
              <div class="ln-metric-label">服务连接状态</div>
              <div class="ln-metric-value ln-metric-status">
                <span class={serverDotClass()} />
                {server.healthy() === true ? "运行正常" : server.healthy() === false ? "连接异常" : "检查中"}
              </div>
              <div class="ln-metric-foot">状态由当前服务连接检测提供</div>
            </article>
            <article class="ln-metric-card">
              <div class="ln-metric-icon ln-icon-violet"><Icon name="bot" size="large" /></div>
              <div class="ln-metric-label">智能体工作流</div>
              <div class="ln-metric-value ln-metric-word">可用能力</div>
              <div class="ln-metric-foot">会话、工具调用与分析辅助</div>
            </article>
            <article class="ln-metric-card">
              <div class="ln-metric-icon ln-icon-amber"><Icon name="shield-check" size="large" /></div>
              <div class="ln-metric-label">安全操作原则</div>
              <div class="ln-metric-value ln-metric-word">授权优先</div>
              <div class="ln-metric-foot">按配置权限执行并保留确认流程</div>
            </article>
          </div>
        </section>

        <section class="ln-workspace-section">
          <div class="ln-section-heading">
            <div>
              <div class="ln-section-kicker">QUICK ACCESS</div>
              <h2>工作入口</h2>
            </div>
          </div>
          <div class="ln-entry-grid">
            <button class="ln-entry-card" onClick={chooseProject}>
              <div class="ln-entry-icon"><Icon name="folder-add-left" size="large" /></div>
              <div class="ln-entry-copy">
                <strong>项目与分析工作区</strong>
                <span>打开项目目录，进入智能体会话、文件审查与终端工作流。</span>
              </div>
              <span class="ln-entry-arrow">↗</span>
            </button>
            <button class="ln-entry-card" onClick={() => dialog.show(() => <DialogSelectServer />)}>
              <div class="ln-entry-icon ln-entry-icon-cyan"><Icon name="server" size="large" /></div>
              <div class="ln-entry-copy">
                <strong>服务连接管理</strong>
                <span>查看或切换当前连接的 CyberStrike 服务。</span>
              </div>
              <span class="ln-entry-arrow">↗</span>
            </button>
          </div>
        </section>

        <section class="ln-recent-section">
          <div class="ln-section-heading">
            <div>
              <div class="ln-section-kicker">RECENT WORKSPACES</div>
              <h2>最近工作区</h2>
            </div>
            <Button size="normal" variant="ghost" class="ln-text-action" onClick={chooseProject}>
              <Icon name="folder-add-left" size="small" />
              打开工作区
            </Button>
          </div>
          <Switch>
            <Match when={recent().length > 0}>
              <div class="ln-recent-list">
                <For each={recent()}>
                  {(project, index) => (
                    <button class="ln-recent-row" onClick={() => openProject(project.worktree)}>
                      <div class="ln-recent-index">{String(index() + 1).padStart(2, "0")}</div>
                      <div class="ln-recent-folder"><Icon name="folder" size="large" /></div>
                      <div class="ln-recent-details">
                        <strong>{project.worktree.replace(homedir(), "~")}</strong>
                        <span>项目工作区</span>
                      </div>
                      <div class="ln-recent-time">
                        <span>最近更新</span>
                        <strong>{DateTime.fromMillis(project.time.updated ?? project.time.created).toRelative()}</strong>
                      </div>
                      <span class="ln-recent-arrow">›</span>
                    </button>
                  )}
                </For>
              </div>
            </Match>
            <Match when={true}>
              <div class="ln-empty-state">
                <div class="ln-empty-icon"><Icon name="folder-add-left" size="large" /></div>
                <strong>尚未关联工作区</strong>
                <p>打开一个项目目录后，即可进入分析工作区并开始使用智能体功能。</p>
                <Button size="large" onClick={chooseProject}>选择项目目录</Button>
              </div>
            </Match>
          </Switch>
        </section>

        <footer class="ln-footer">
          <span>辽宁省某单位网络安全检测与研判平台 <b>·</b> 单位名称为设计占位信息</span>
          <span>CYBERSTRIKE · SECURITY WORKSPACE</span>
        </footer>
      </div>
    </main>
  )
}
