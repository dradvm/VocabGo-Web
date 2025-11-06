export class Word {
  word_id!: string;
  word!: string;
  word_pos: WordPos[] = [];
}

export class WordPos {
  word_pos_id!: string;
  word!: string;
  level_id!: string;
  pos_tag_id!: string;
  levels: Level = new Level();
  pos_tags: PosTag = new PosTag();
}
export class Level {
  level_name!: string;
}
export class PosTag {
  pos_tag!: string;
}
