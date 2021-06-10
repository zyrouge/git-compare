import got from "got";
import { isConventional } from "./util";

export interface IOptions {
    repo: {
        author: string;
        repo: string;
    };
    version: {
        previous: string;
        current: string;
    };
    allowOnlyConventional: boolean;
    filterDuplicatesMsg: boolean;
}

export interface ICommit {
    id: string;
    msg: string;
    author: {
        username: string;
        avatar: string | null;
        email: string;
    };
    sha: string;
    date: Date;
}

export const compare = async (options: IOptions) => {
    const url = `https://api.github.com/repos/${options.repo.author}/${options.repo.repo}/compare/${options.version.previous}...${options.version.current}`;
    const { body } = await got.get(url, {
        responseType: "text",
    });
    const data: any = JSON.parse(body);

    let commits: ICommit[] = (<any[]>data.commits)
        .map((x) => ({
            id: x.sha.slice(0, 7),
            msg: x.commit.message,
            author: {
                username: x.author.login,
                avatar: x.author.avatar_url || x.author.gravatar_id || null,
                email: x.commit.author.email,
            },
            sha: x.sha,
            date: new Date(x.commit.author.date),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (options.allowOnlyConventional) {
        commits = commits.filter((x) => isConventional(x.msg));
    }

    if (options.filterDuplicatesMsg) {
        commits = commits.reduce((pv, cv) => {
            if (!pv.some((x) => x.msg === cv.msg)) {
                pv.push(cv);
            }

            return pv;
        }, <ICommit[]>[]);
    }

    return commits;
};
