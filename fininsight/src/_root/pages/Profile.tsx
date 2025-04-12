import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queriesAndMutations";
import { ProfileValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ProfileUploader from "@/components/shared/ProfileUplod";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
    },
  });

  // Queries
  const { data: currentUser } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } =
    useUpdateUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  // Handler
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    try {
      const updatedUser = await updateUser({
        userId: currentUser.$id,
        name: value.name,
        username: currentUser.username,
        email: currentUser.email,
        file: value.file,
        imageUrl: currentUser.imageUrl,
        imageId: currentUser.imageId,
      });

      if (!updatedUser) {
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUser({
        ...user,
        name: updatedUser.name,
        imageUrl: updatedUser.imageUrl,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 justify-center items-start pt-12">
      <div className="common-container">
        <div className="flex-center flex-col w-full max-w-5xl">
          <h2 className="h1-bold md:text-4xl text-center w-full mb-12">Edit Profile</h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="flex justify-center">
                    <FormControl>
                      <div className="w-32 h-32 p-2">
                        <ProfileUploader
                          fieldChange={field.onChange}
                          mediaUrl={currentUser.imageUrl}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="shad-form_message text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label text-lg">Name</FormLabel>
                    <FormControl>
                      <Input type="text" className="shad-input text-lg h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label text-lg">Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="shad-input text-lg h-12"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="shad-input text-lg h-12"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-6 items-center justify-center mt-8">
                <Button
                  type="button"
                  className="shad-button_dark_4 text-lg h-12 px-8"
                  onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="shad-button_primary whitespace-nowrap text-lg h-12 px-8"
                  disabled={isLoadingUpdate}>
                  {isLoadingUpdate && <Loader />}
                  Update Profile
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;