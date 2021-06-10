export const isConventional = (text: string) =>
    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test){1}(\([\w-\.]+\))?(!)?: ([\w ])+([\s\S]*)/.test(
        text
    );
