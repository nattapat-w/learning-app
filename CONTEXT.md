# Domain Glossary — Reddit Clone

Ubiquitous language for this project. Implementation details live in code and `docs/` — not here.

| Term | Definition |
|------|------------|
| **User** | Person with an account (username, email, password). Can author content and vote. |
| **Author** | The User who created a specific Post or Comment. Not a separate entity — always `authorId` → User. |
| **Community** | Named space for posts (user-facing: subreddit, URL `/r/name`). Has `name` (slug), `title`, `description`. |
| **Post** | Top-level submission in a Community. Has title, optional body, score, timestamps. |
| **Comment** | Text reply on a Post. May nest under another Comment via parent reference. |
| **Vote** | A User's +1 or −1 on exactly one Post or Comment. One vote per User per target. |
| **Score** | Net votes on a Post or Comment (sum of vote values). Displayed on listings. |
| **Thread** | A Post plus all its Comments (not a separate database entity). |
| **Profile** | Public view of a User: username, display name, bio, avatar, activity history. |
