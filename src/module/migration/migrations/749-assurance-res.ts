import { SkillSlug } from "@actor/types.ts";
import { CORE_SKILL_SLUGS } from "@actor/values.ts";
import { ItemSourcePF2e } from "@item/base/data/index.ts";
import { RuleElementSource } from "@module/rules/index.ts";
import { ChoiceSetSource } from "@module/rules/rule-element/choice-set/data.ts";
import { setHasElement } from "@util";
import { MigrationBase } from "../base.ts";

export class Migration749AssuranceREs extends MigrationBase {
    static override version = 0.749;

    #isChoiceSetWithSelection(rule: RuleElementSource): rule is ChoiceSetSource {
        return rule.key === "ChoiceSet";
    }

    #newRules(skill: SkillSlug | "choice"): RuleElementSource[] {
        const selector = skill === "choice" ? "{item|flags.pf2e.rulesSelections.assurance}" : skill;
        const rules = [
            {
                key: "SubstituteRoll",
                label: "PF2E.SpecificRule.SubstituteRoll.Assurance",
                selector,
                slug: "assurance",
                value: 10,
            },
            {
                key: "AdjustModifier",
                predicate: {
                    all: ["substitute:assurance"],
                    not: ["bonus:type:proficiency"],
                },
                selector,
                suppress: true,
            },
        ];

        return rules;
    }

    override async updateItem(source: ItemSourcePF2e): Promise<void> {
        const { slug, rules } = source.system;
        if (!(source.type === "feat" && slug?.startsWith("assurance"))) {
            return;
        }

        const firstRule: (RuleElementSource & { flag?: string }) | undefined = rules.at(0);
        if (slug === "assurance" && firstRule && rules.length === 1 && this.#isChoiceSetWithSelection(firstRule)) {
            firstRule.flag = "assurance";
            rules.push(...this.#newRules("choice"));
        } else if (rules.length === 0) {
            const skill = /^assurance-([a-z]+)$/.exec(slug)?.at(1);
            if (setHasElement(CORE_SKILL_SLUGS, skill)) {
                rules.push(...this.#newRules(skill));
            }
        }
    }
}
