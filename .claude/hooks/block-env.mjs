// PreToolUse hook: Claude'un .env dosyalarını okumasını / değiştirmesini engeller.
// .env.example serbesttir (gizli bilgi içermez).
// `--env-file=...` bayrağı serbesttir: değişkenleri bir sürece yükler, içeriği ekrana basmaz.

const deny = (reason) => {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
};

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

// Girdi okunamazsa güvenli tarafta kal: engelle (fail-closed)
let input;
try {
  input = JSON.parse(raw).tool_input ?? {};
} catch {
  deny(".env koruma hook'u girdiyi okuyamadı; güvenlik için işlem engellendi.");
}

// Dosya yolu alan araçlar (Read, Edit, Write, NotebookEdit, Grep, Glob)
const paths = [input.file_path, input.notebook_path, input.path, input.glob, input.pattern].filter(
  (v) => typeof v === 'string',
);

// Kabuk komutları (Bash, PowerShell): --env-file bayrağını çıkarıp kalan metne bak
const command =
  typeof input.command === 'string' ? input.command.replace(/--env-file[= ]\S+/g, '') : '';

// ".env", ".env.local", ".env.production" ... yakalar; "process.env" gibi kod ifadelerini yakalamaz
const ENV_TOKEN = /(?<![\w$])\.env[\w.-]*/g;
const isSecret = (token) => token !== '.env.example';

const hits = [...paths, command].flatMap((text) => text.match(ENV_TOKEN) ?? []).filter(isSecret);

if (hits.length > 0) {
  deny(
    `.env dosyalarına erişim engellendi (${[...new Set(hits)].join(', ')}). Gizli değerler için .env.example'a bak veya kullanıcıya sor.`,
  );
}
