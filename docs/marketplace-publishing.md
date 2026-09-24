# 自动发布到 Visual Studio Marketplace

正式 GitHub Release 发布后，Publish Marketplace 工作流校验标签和版本、运行测试、打包，然后发布到微软市场。普通 main 推送和 PR 只运行测试。草稿和预发布 Release 不自动上传。

## 一次性配置：Microsoft Entra ID / GitHub OIDC

此方案不使用即将退役的全局 PAT。需要你有可管理的 Microsoft Entra 租户及应用/身份，单纯登录个人 Microsoft 账号并不等于已完成此配置。

1. 在 Microsoft Entra 中创建用于发布的应用注册及其服务主体，或使用用户分配托管身份。记录该身份的 Client ID 和 Tenant ID。
2. 为该身份添加 GitHub Actions 联合身份凭据：
   - Issuer: `https://token.actions.githubusercontent.com`
   - Subject: `repo:yangshuochina/paste-path-as:environment:marketplace`
   - Audience: `api://AzureADTokenExchange`
3. 按微软官方指南将该身份加入 Azure DevOps / Marketplace 身份系统，再将其作为 Contributor 加入发布者 `yangshuochina`。必须使用 Azure DevOps 返回的身份 ID，而不是直接把 Client ID 当作发布者成员 ID；仅完成 Azure 登录不足以发布。
4. GitHub 仓库 Settings → Environments → 创建 `marketplace`。在 Environment secrets 中添加 `AZURE_CLIENT_ID` 和 `AZURE_TENANT_ID`。这两个值不需要发送到聊天，也不需要创建客户端密码。
5. 身份授权完成后，先执行下方演练，再对尚未发布的版本运行正式发布。

官方步骤：https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace

GitHub OIDC 登录：https://github.com/Azure/login#login-with-openid-connect-oidc-recommended

## 演练和补发已有 Release

Actions → Publish Marketplace → Run workflow，工作流分支选 `main`，tag 填 `v1.0.1` 等已有版本。

- 保持 `dry_run` 勾选：只测试和生成安装包，不需要微软凭据，也不会上传市场。
- 取消勾选：用该标签源码重新测试、打包、发布。若该版本已在市场存在，不应重复发布；应更新版本后创建新 Release。

安装包位于工作流运行页的 Artifacts。市场上传后仍需经过其验证。

## 以后发布

1. 修改代码和 package.json 版本，例如 `1.0.2`，更新 CHANGELOG。
2. 推送提交，并在该提交上发布正式 GitHub Release `v1.0.2`。
3. 查看 Actions 的 Publish Marketplace 结果。

工作流加入之前的 Release 不会自动追溯触发；使用手动入口补发。若通过另一工作流的默认 GITHUB_TOKEN 创建 Release，可能不会触发此工作流；应显式调用手动入口或改用授权的发布身份。

身份配置完成前，自动上传尚不可用。测试和打包成功不代表真实发布认证已验证。
