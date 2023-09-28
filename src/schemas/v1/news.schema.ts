import { z } from 'zod';

const query = {
  query: z
    .object({
      clubId: z
        .string({
          required_error: 'clubId is required as query parameter',
        })
        .trim(),
      from: z
        .string()
        .trim()
        .datetime({
          message:
            'Invalid value in from query parameter! Must be UTC in ISO format.',
        })
        .optional(),
      to: z
        .string()
        .trim()
        .datetime({
          message:
            'Invalid value in to query parameter! Must be UTC in ISO format.',
        })
        .optional(),
    })
    .refine(
      (data) => {
        if (data?.from !== undefined && data?.to !== undefined) {
          return new Date(data.from).getTime() < new Date(data.to).getTime();
        }

        return true;
      },
      {
        message:
          'The date in from query parameter must be earlier than to parameter',
        path: ['from'],
      }
    ),
};

export const getClubNewsSchema = z.object({
  ...query,
});

export type TGetClubNewsInput = z.TypeOf<typeof getClubNewsSchema>;
