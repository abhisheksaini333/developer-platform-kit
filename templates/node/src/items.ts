export interface Item {id: number; title: string;}
export function validateItem(value: unknown): string | undefined {
 if(!value || typeof value!=='object' || Array.isArray(value)) return 'Expected a JSON object';
 const title=(value as Record<string,unknown>).title;
 if(typeof title!=='string' || !title.trim() || title.length>200) return 'Title must contain 1–200 characters';
 return undefined;
}
