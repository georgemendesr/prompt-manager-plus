import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinksHeader } from "@/components/links/LinksHeader";
import { LinkList } from "@/components/links/LinkList";
import { LyricList } from "@/components/lyrics/LyricList";
import { useLinks } from "@/hooks/useLinks";
import { useLyrics } from "@/hooks/useLyrics";
import { useAuth } from "@/components/AuthProvider";

const LinksPage = () => {
  const { signOut } = useAuth();
  const { links, loadError: linksError, addLink, editLink, deleteLink } = useLinks();
  const { lyrics, loadError: lyricsError, addLyric, editLyric, deleteLyric } = useLyrics();

  return (
    <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
      <div className="max-w-3xl mx-auto">
        <LinksHeader onSignOut={signOut} />
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
            <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
            <TabsTrigger value="lyrics" className="flex-1">Letras de Músicas</TabsTrigger>
          </TabsList>
          <TabsContent value="links">
            <LinkList
              links={links}
              loadError={linksError}
              onAddLink={addLink}
              onEditLink={editLink}
              onDeleteLink={deleteLink}
            />
          </TabsContent>
          <TabsContent value="lyrics">
            <LyricList
              lyrics={lyrics}
              loadError={lyricsError}
              onAddLyric={addLyric}
              onEditLyric={editLyric}
              onDeleteLyric={deleteLyric}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LinksPage;
