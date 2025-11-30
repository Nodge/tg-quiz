import type { Question } from '../entities/Question';
import type { QuestionsRepository } from '../repositories/questions.repository';
import type { CurrentUserService } from '../services/current-user.service';
import type { QuestionsService } from '../services/questions.service';

export class ReorderQuestionsUseCase {
    constructor(
        private repository: QuestionsRepository,
        private questionsService: QuestionsService,
        private currentUser: CurrentUserService
    ) {}

    async execute(questions: Question[]): Promise<void> {
        this.currentUser.assertAdmin();

        const savedQuestions = await this.questionsService.getAllQuestions();
        const savedQuestionsMap = new Map<string, Question>(savedQuestions.map(item => [item.id, item]));
        const itemsToSave: Question[] = [];

        for (const item of questions) {
            const savedItem = savedQuestionsMap.get(item.id);
            if (savedItem && savedItem.index !== item.index) {
                itemsToSave.push({
                    ...savedItem,
                    index: item.index,
                });
            }
        }

        if (itemsToSave.length === 0) {
            return;
        }

        await this.repository.updateBatch(itemsToSave);
    }
}
