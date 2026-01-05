import { Drawer } from 'vaul';
import { useUIStore } from '@/store/ui.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming we have this, or I'll use standard input with class
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Loader2, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label'; // Assuming standard Shadcn label
import { useState, useRef } from 'react';

const schema = z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters'),
    currency: z.string().min(1, 'Currency is required'),
});

type FormData = z.infer<typeof schema>;

export function CreateGroupDrawer() {
    const { isCreateGroupOpen, closeCreateGroup, openCreateGroup, currency } = useUIStore();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            currency: currency,
        }
    });

    const mutation = useMutation({
        mutationFn: api.createGroup, // Need to add this to api.ts
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            closeCreateGroup();
            reset();
        },
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: FormData) => {
        mutation.mutate({
            name: data.name,
            currency: data.currency,
            members: [], // api will handle adding current user or we mock it
            imageUrl: imagePreview || undefined // Pass image URL
        });
    };

    return (
        <Drawer.Root open={isCreateGroupOpen} onOpenChange={(open) => open ? openCreateGroup() : closeCreateGroup()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-50 border-t border-border focus:outline-none max-h-[85vh]">
                    <div className="p-4 bg-card rounded-t-[20px] flex-1 pb-10">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
                        <div className="max-w-md mx-auto">
                            <h2 className="text-xl font-bold mb-6 text-center">Create New Group</h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Group Cover</Label>
                                    <div className="flex flex-col gap-3">
                                        {imagePreview ? (
                                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border group">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-40 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
                                            >
                                                <div className="p-3 bg-muted rounded-full">
                                                    <Upload size={24} />
                                                </div>
                                                <span className="text-sm font-medium">Click to upload cover image</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Group Name</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        placeholder="e.g. Bali Trip 🌴"
                                        className="bg-background"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Default Currency</Label>
                                    <select
                                        id="currency"
                                        {...register('currency')}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="IDR">IDR (Rp)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="JPY">JPY (¥)</option>
                                    </select>
                                    {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
                                </div>

                                <Button type="submit" className="w-full h-12 text-md" disabled={mutation.isPending}>
                                    {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                    {mutation.isPending ? 'Creating...' : 'Create Group'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
