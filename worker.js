// Cloudflare Worker: ツール内のFBボタンからのPOSTを受け、GitHub Issueを自動作成する。
// デプロイ手順は README ではなくチャットで案内済み。
// 必要なシークレット: GITHUB_TOKEN (fine-grained PAT, Issues: Read and write)

const ALLOWED_ORIGIN = 'https://saussure1234.github.io';
const REPO_OWNER = 'saussure1234';
const REPO_NAME = 'prompt-upgrade';
const MAX_FEEDBACK_LEN = 5000;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method !== 'POST') {
      return jsonError(405, 'method_not_allowed', request);
    }

    const origin = request.headers.get('Origin');
    if (origin !== ALLOWED_ORIGIN) {
      return jsonError(403, 'forbidden_origin', request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, 'invalid_json', request);
    }

    const feedback = (body.feedback || '').trim();
    if (!feedback) return jsonError(400, 'feedback_required', request);
    if (feedback.length > MAX_FEEDBACK_LEN) return jsonError(400, 'feedback_too_long', request);

    const reporter = (body.reporter || '').trim().slice(0, 100);
    const context = body.context ?? null;

    const titleSource = feedback.split('\n')[0].slice(0, 80);
    const title = `[FB] ${titleSource}`;

    const bodyLines = ['## フィードバック', '', feedback, ''];
    if (reporter) {
      bodyLines.push(`**書いた人**: ${reporter}`, '');
    }
    if (context && typeof context === 'object') {
      bodyLines.push('## コンテキスト（自動添付）', '```json', JSON.stringify(context, null, 2), '```', '');
    }
    bodyLines.push('---', '_このIssueはツール内のFBボタンから自動作成されました_');

    const ghRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'prompt-upgrade-fb-worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body: bodyLines.join('\n') }),
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      console.log('github_error', ghRes.status, errText);
      return jsonError(502, 'github_create_failed', request);
    }

    const issue = await ghRes.json();
    return new Response(
      JSON.stringify({ ok: true, issue_url: issue.html_url, issue_number: issue.number }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(request) } }
    );
  },
};

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonError(status, code, request) {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}
