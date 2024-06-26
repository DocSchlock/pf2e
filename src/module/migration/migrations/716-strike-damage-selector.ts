import { ItemSourcePF2e } from "@item/base/data/index.ts";
import * as R from "remeda";
import { MigrationBase } from "../base.ts";

export class Migration716StrikeDamageSelector extends MigrationBase {
    static override version = 0.716;

    private itemsToSkip = new Set([
        "effect-fanatical-frenzy",
        "effect-heroic-recovery",
        "effect-lantern-of-hope",
        "effect-lantern-of-hope-gestalt",
        "spell-effect-inspire-courage",
        "spell-effect-inspire-heroics-courage-2",
        "spell-effect-inspire-heroics-courage-3",
        "spell-effect-stoke-the-heart",
    ]);

    override async updateItem(source: ItemSourcePF2e): Promise<void> {
        if (this.itemsToSkip.has(source.system.slug ?? "")) return;

        const rules: unknown[] = source.system.rules;
        for (const rule of rules) {
            if (R.isPlainObject(rule) && ["damage", "mundane-damage"].includes(String(rule.selector ?? ""))) {
                rule.selector = "strike-damage";
            }
        }
    }
}
