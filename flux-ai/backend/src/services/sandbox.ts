type SandboxResult = { ok: boolean; output?: any; error?: string };

export async function runExpression(expression: string, context: Record<string, any> = {}): Promise<SandboxResult> {
  try {
    // Minimal evaluator for arithmetic/JSON-safe operations; not secure for untrusted input in production.
    // Replace with Docker/VM sandboxes for real isolation.
    const fn = new Function('ctx', `with (ctx) { return (${expression}); }`);
    const output = fn(context);
    return { ok: true, output };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function runCustomCode(code: string, input: any): Promise<SandboxResult> {
  try {
    const fn = new Function('input', `${code}; return typeof run === 'function' ? run(input) : null;`);
    const output = await fn(input);
    return { ok: true, output };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}


